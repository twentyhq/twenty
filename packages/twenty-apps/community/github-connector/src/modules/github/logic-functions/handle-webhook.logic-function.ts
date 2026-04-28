import { defineLogicFunction } from 'twenty-sdk/define';
import { type RoutePayload } from 'twenty-sdk/logic-function';
import type { GitHubWebhookPayload } from 'src/modules/github/connector/webhook-payload';
import type { ProjectV2Item } from 'src/modules/github/project-item/types/project-v2-item';
import { fetchProjectItemByNodeId } from 'src/modules/github/project-item/graphql/github/fetch-project-item-by-node-id';
import {
  getRawBodyForSignature,
  verifyGitHubSignature,
} from 'src/modules/github/connector/webhook-signature';
import { batchUpsertContributors } from 'src/modules/github/contributor/graphql/mutations/batch-upsert';
import { batchUpsertPullRequests } from 'src/modules/github/pull-request/graphql/mutations/batch-upsert';
import { batchUpsertReviewEvents } from 'src/modules/github/pull-request-review-event/graphql/mutations/batch-upsert';
import { batchUpsertConsolidatedReviews } from 'src/modules/github/pull-request-review/graphql/mutations/batch-upsert';
import { findReviewEventsForPair } from 'src/modules/github/pull-request-review-event/graphql/queries/find-events-for-pair';
import { buildConsolidatedRow } from 'src/modules/github/pull-request-review/utils/build-consolidated-row';
import type { ReviewEventState } from 'src/modules/github/pull-request-review/utils/consolidate-reviews';
import { batchUpsertIssues } from 'src/modules/github/issue/graphql/mutations/batch-upsert';
import { batchUpsertProjectItems } from 'src/modules/github/project-item/graphql/mutations/batch-upsert';
import { dedupeContributors } from 'src/modules/github/contributor/normalizers';
import { pullRequestFromWebhook } from 'src/modules/github/pull-request/normalizers';
import { reviewEventFromWebhook } from 'src/modules/github/pull-request-review-event/normalizers';
import { issueFromWebhook } from 'src/modules/github/issue/normalizers';
import { projectItemFromGraphql } from 'src/modules/github/project-item/normalizers';

async function upsertContributorsByLogin(
  users: Array<{ login: string; id?: number } | null | undefined>,
): Promise<Map<string, string>> {
  const inputs = dedupeContributors(users);
  if (inputs.length === 0) return new Map();
  const rows = await batchUpsertContributors(inputs);
  const map = new Map<string, string>();
  for (const r of rows) {
    if (r.ghLogin) map.set(r.ghLogin, r.id);
  }
  return map;
}

async function handlePullRequestEvent(payload: GitHubWebhookPayload) {
  const pr = payload.pull_request;
  const repository = payload.repository;
  if (!pr || !repository) {
    return { skipped: true, reason: 'missing pull_request or repository' };
  }

  const idByLogin = await upsertContributorsByLogin([pr.user, pr.merged_by]);
  const authorId = idByLogin.get(pr.user.login) ?? null;
  const mergerId = pr.merged_by
    ? (idByLogin.get(pr.merged_by.login) ?? null)
    : null;

  const canonical = pullRequestFromWebhook(pr, repository.full_name);

  const [record] = await batchUpsertPullRequests([
    { ...canonical, authorId, mergerId },
  ]);

  return {
    processed: true,
    pullRequestId: record?.id,
    action: payload.action,
    state: canonical.state,
  };
}

async function handlePullRequestReviewEvent(payload: GitHubWebhookPayload) {
  const review = payload.review;
  const pr = payload.pull_request;
  const repository = payload.repository;
  if (!review || !pr || !repository) {
    return {
      skipped: true,
      reason: 'missing review, pull_request, or repository',
    };
  }

  const idByLogin = await upsertContributorsByLogin([
    pr.user,
    pr.merged_by,
    review.user,
  ]);

  const prCanonical = pullRequestFromWebhook(pr, repository.full_name);
  const [prRecord] = await batchUpsertPullRequests([
    {
      ...prCanonical,
      authorId: idByLogin.get(pr.user.login) ?? null,
      mergerId: pr.merged_by
        ? (idByLogin.get(pr.merged_by.login) ?? null)
        : null,
    },
  ]);

  const reviewCanonical = reviewEventFromWebhook(review);
  const reviewerId = idByLogin.get(review.user.login) ?? null;
  const pullRequestId = prRecord?.id ?? '';

  const [eventRecord] = await batchUpsertReviewEvents([
    {
      ...reviewCanonical,
      reviewerId,
      pullRequestId,
    },
  ]);

  let consolidatedId: string | undefined;
  if (pullRequestId) {
    const events = await findReviewEventsForPair(pullRequestId, reviewerId);
    if (events.length > 0) {
      const consolidatedRow = buildConsolidatedRow({
        pullRequestId,
        reviewerId,
        prNumber: pr.number ?? null,
        reviewerLogin: review.user.login,
        events: events.map((e) => ({
          state: e.state as ReviewEventState,
          submittedAt: e.submittedAt,
        })),
      });
      const [consolidatedRecord] = await batchUpsertConsolidatedReviews([
        consolidatedRow,
      ]);
      consolidatedId = consolidatedRecord?.id;

      if (consolidatedId && eventRecord?.id) {
        await batchUpsertReviewEvents([
          {
            ...reviewCanonical,
            reviewerId,
            pullRequestId,
            reviewId: consolidatedId,
          },
        ]);
      }
    }
  }

  return {
    processed: true,
    reviewEventId: eventRecord?.id,
    reviewId: consolidatedId,
    pullRequestId: prRecord?.id,
    action: payload.action,
  };
}

async function handleIssueEvent(payload: GitHubWebhookPayload) {
  const issue = payload.issue;
  const repository = payload.repository;
  if (!issue || !repository) {
    return { skipped: true, reason: 'missing issue or repository' };
  }

  const idByLogin = await upsertContributorsByLogin([issue.user]);
  const canonical = issueFromWebhook(issue, repository.full_name);

  const [record] = await batchUpsertIssues([
    { ...canonical, authorId: idByLogin.get(issue.user.login) ?? null },
  ]);

  return {
    processed: true,
    issueId: record?.id,
    action: payload.action,
  };
}

async function handleProjectV2ItemEvent(
  payload: GitHubWebhookPayload,
  testProjectItem?: ProjectV2Item,
) {
  const item = payload.projects_v2_item;
  if (!item?.node_id) {
    return { skipped: true, reason: 'missing projects_v2_item.node_id' };
  }

  if (payload.action === 'deleted') {
    console.log(
      `[handle-webhook] projects_v2_item delete skipped (nodeId=${item.node_id})`,
    );
    return { skipped: true, reason: 'delete not implemented' };
  }

  const node =
    testProjectItem ?? (await fetchProjectItemByNodeId(item.node_id));
  if (!node) {
    return { skipped: true, reason: 'project item not found on GitHub' };
  }

  const canonical = await projectItemFromGraphql(node);
  const [record] = await batchUpsertProjectItems([canonical]);

  return {
    processed: true,
    projectItemId: record?.id,
    action: payload.action,
  };
}

const handler = async (
  event: RoutePayload<
    GitHubWebhookPayload & { __test_projectItem?: ProjectV2Item }
  >,
) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (secret) {
    const signatureHeader =
      event.headers?.['x-hub-signature-256'] ??
      event.headers?.['X-Hub-Signature-256'];
    const rawBody = getRawBodyForSignature(event);
    const verification = verifyGitHubSignature({
      rawBody,
      signatureHeader,
      secret,
    });
    if (!verification.ok) {
      const delivery =
        event.headers?.['x-github-delivery'] ??
        event.headers?.['X-GitHub-Delivery'];
      console.warn(
        `[handle-webhook] signature verification failed (${verification.reason}) delivery=${delivery ?? 'unknown'}`,
      );
      return { error: 'invalid signature', reason: verification.reason };
    }
  } else {
    console.warn(
      '[handle-webhook] GITHUB_WEBHOOK_SECRET is not set; skipping signature verification (insecure)',
    );
  }

  const payload = event.body;
  if (!payload) return { error: 'empty body' };

  if (payload.pull_request && payload.review) {
    return handlePullRequestReviewEvent(payload);
  }
  if (payload.pull_request) {
    return handlePullRequestEvent(payload);
  }
  if (payload.issue) {
    return handleIssueEvent(payload);
  }
  if (payload.projects_v2_item) {
    return handleProjectV2ItemEvent(payload, payload.__test_projectItem);
  }

  return { skipped: true, reason: 'unhandled event' };
};

export default defineLogicFunction({
  universalIdentifier: '22b199b3-2851-4a4f-99fd-4e79c188fe7d',
  name: 'handle-github-webhook',
  description:
    'Receives GitHub webhook events for PRs, reviews, issues, and project items; idempotent upserts via shared batch helpers',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/github/webhook',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: [
      'x-hub-signature-256',
      'x-github-event',
      'x-github-delivery',
    ],
  },
});
