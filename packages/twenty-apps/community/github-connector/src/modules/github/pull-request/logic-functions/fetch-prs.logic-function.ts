import { defineLogicFunction } from 'twenty-sdk/define';
import { type RoutePayload } from 'twenty-sdk/logic-function';
import {
  fetchPullRequests,
  type GqlPullRequest,
} from 'src/modules/github/pull-request/graphql/github/fetch-pull-requests';
import { batchUpsertContributors } from 'src/modules/github/contributor/graphql/mutations/batch-upsert';
import { batchUpsertPullRequests } from 'src/modules/github/pull-request/graphql/mutations/batch-upsert';
import { batchUpsertReviewEvents } from 'src/modules/github/pull-request-review-event/graphql/mutations/batch-upsert';
import { batchUpsertConsolidatedReviews } from 'src/modules/github/pull-request-review/graphql/mutations/batch-upsert';
import { buildConsolidatedRow } from 'src/modules/github/pull-request-review/utils/build-consolidated-row';
import { dedupeContributors } from 'src/modules/github/contributor/normalizers';
import { pullRequestFromGraphql } from 'src/modules/github/pull-request/normalizers';
import {
  reviewEventFromGraphql,
  type ReviewEventState,
} from 'src/modules/github/pull-request-review-event/normalizers';
import { timed } from 'src/modules/shared/timing';
import { isFixtureAllowed } from 'src/modules/shared/fixtures';

export type FetchPrsFixturePage = {
  prs: GqlPullRequest[];
  totalCount: number;
  hasMore: boolean;
  endCursor: string | null;
};

type FetchPrsPayload = {
  owner: string;
  repo: string;
  cursor?: string | null;
  fixturePage?: FetchPrsFixturePage;
};

const handler = async (event: RoutePayload<FetchPrsPayload>) => {
  const handlerStart = Date.now();
  const { owner, repo, cursor = null, fixturePage } = event.body ?? {};
  if (!owner || !repo) {
    return { error: 'owner and repo are required' };
  }

  const tag = `${owner}/${repo}${cursor ? `@${cursor.slice(0, 8)}` : ''}`;
  console.log(`[fetch-prs] start ${tag}${fixturePage ? ' (fixture)' : ''}`);

  const result =
    fixturePage && isFixtureAllowed()
      ? fixturePage
      : await timed(`fetch-prs:github ${tag}`, () =>
          fetchPullRequests(owner, repo, cursor),
        );
  const { prs, totalCount, hasMore, endCursor } = result;

  if (prs.length === 0) {
    console.log(`[fetch-prs] empty page for ${tag}`);
    return {
      prCount: 0,
      reviewCount: 0,
      totalCount,
      hasMore: false,
      endCursor: null,
    };
  }

  const allUsers = prs.flatMap((pr) => [
    pr.author,
    pr.mergedBy,
    ...pr.reviews.nodes.map((r) => r.author),
  ]);
  const contributorInputs = dedupeContributors(allUsers);
  const contributors = await timed(
    `fetch-prs:upsertContributors ${tag} (${contributorInputs.length})`,
    () => batchUpsertContributors(contributorInputs),
  );

  const idByLogin = new Map<string, string>();
  for (const c of contributors) {
    if (c.ghLogin) idByLogin.set(c.ghLogin, c.id);
  }

  const fullRepo = `${owner}/${repo}`;

  const prData = prs.map((pr) => ({
    ...pullRequestFromGraphql(pr, fullRepo),
    authorId: pr.author ? (idByLogin.get(pr.author.login) ?? null) : null,
    mergerId: pr.mergedBy ? (idByLogin.get(pr.mergedBy.login) ?? null) : null,
  }));

  const prRecords = await timed(
    `fetch-prs:upsertPullRequests ${tag} (${prData.length})`,
    () => batchUpsertPullRequests(prData),
  );

  const prIdByNumber = new Map<number, string>();
  for (const rec of prRecords) {
    if (rec.githubNumber) prIdByNumber.set(rec.githubNumber, rec.id);
  }

  type ReviewEventInput = {
    githubReviewId: number;
    title: string;
    state: string;
    submittedAt: string | null;
    reviewerId: string | null;
    pullRequestId: string;
  };

  type GroupKey = string;
  type GroupContext = {
    pullRequestId: string;
    reviewerId: string | null;
    prNumber: number;
    reviewerLogin: string | null;
    prAuthorId: string | null;
    events: { state: ReviewEventState; submittedAt: string | null }[];
  };

  const authorIdByPullRequestId = new Map<string, string | null>();
  for (const pr of prData) {
    const id = prIdByNumber.get(pr.githubNumber);
    if (id) authorIdByPullRequestId.set(id, pr.authorId);
  }

  let skippedReviews = 0;
  const reviewEventData: ReviewEventInput[] = [];
  const groups = new Map<GroupKey, GroupContext>();

  for (const pr of prs) {
    const pullRequestId = prIdByNumber.get(pr.number);
    if (!pullRequestId) {
      skippedReviews += pr.reviews.nodes.length;
      continue;
    }
    for (const review of pr.reviews.nodes) {
      const reviewerId = review.author
        ? (idByLogin.get(review.author.login) ?? null)
        : null;
      const canonical = reviewEventFromGraphql(review);
      reviewEventData.push({
        ...canonical,
        reviewerId,
        pullRequestId,
      });
      const key = `${pullRequestId}:${reviewerId ?? 'unknown'}`;
      let group = groups.get(key);
      if (!group) {
        group = {
          pullRequestId,
          reviewerId,
          prNumber: pr.number,
          reviewerLogin: review.author?.login ?? null,
          prAuthorId: authorIdByPullRequestId.get(pullRequestId) ?? null,
          events: [],
        };
        groups.set(key, group);
      }
      if (!group.reviewerLogin && review.author?.login) {
        group.reviewerLogin = review.author.login;
      }
      group.events.push({
        state: canonical.state,
        submittedAt: canonical.submittedAt,
      });
    }
  }

  if (skippedReviews > 0) {
    console.log(
      `[fetch-prs] skipped ${skippedReviews} reviews with no matching PR for ${tag}`,
    );
  }

  if (reviewEventData.length > 0) {
    await timed(
      `fetch-prs:upsertReviewEvents ${tag} (${reviewEventData.length})`,
      () => batchUpsertReviewEvents(reviewEventData),
    );
  }

  let consolidatedCount = 0;
  if (groups.size > 0) {
    const consolidatedRows = Array.from(groups.values()).map((group) =>
      buildConsolidatedRow({
        pullRequestId: group.pullRequestId,
        reviewerId: group.reviewerId,
        prNumber: group.prNumber,
        reviewerLogin: group.reviewerLogin,
        events: group.events,
        prAuthorId: group.prAuthorId,
      }),
    );
    const consolidatedRecords = await timed(
      `fetch-prs:upsertConsolidatedReviews ${tag} (${consolidatedRows.length})`,
      () => batchUpsertConsolidatedReviews(consolidatedRows),
    );
    consolidatedCount = consolidatedRecords.length;

    const reviewIdByKey = new Map<string, string>();
    for (const rec of consolidatedRecords) {
      if (rec.reviewKey && rec.id) reviewIdByKey.set(rec.reviewKey, rec.id);
    }

    const eventBackfill: ReviewEventInput[] = reviewEventData
      .map((evt) => {
        const key = `${evt.pullRequestId}:${evt.reviewerId ?? 'unknown'}`;
        const reviewId = reviewIdByKey.get(key);
        if (!reviewId) return null;
        return { ...evt, reviewId };
      })
      .filter((x): x is ReviewEventInput & { reviewId: string } => x !== null);

    if (eventBackfill.length > 0) {
      await timed(
        `fetch-prs:backfillReviewIds ${tag} (${eventBackfill.length})`,
        () => batchUpsertReviewEvents(eventBackfill),
      );
    }
  }

  const totalMs = Date.now() - handlerStart;
  console.log(
    `[fetch-prs] done ${tag} in ${totalMs}ms (prs=${prs.length}, reviewEvents=${reviewEventData.length}, consolidatedReviews=${consolidatedCount}, hasMore=${hasMore})`,
  );

  return {
    prCount: prs.length,
    reviewCount: reviewEventData.length,
    consolidatedReviewCount: consolidatedCount,
    totalCount,
    hasMore,
    endCursor,
  };
};

export default defineLogicFunction({
  universalIdentifier: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  name: 'fetch-prs',
  description:
    'Fetches one page of pull requests with reviews via GitHub GraphQL API and batch upserts them',
  timeoutSeconds: 300,
  handler,
  httpRouteTriggerSettings: {
    path: '/github/fetch-prs',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
