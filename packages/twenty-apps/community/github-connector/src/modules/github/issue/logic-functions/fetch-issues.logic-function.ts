import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  fetchIssuesGraphQL,
  type GqlIssue,
} from 'src/modules/github/connector/graphql';
import { batchUpsertEngineers } from 'src/modules/engineer/graphql/mutations/batch-upsert';
import { batchUpsertIssues } from 'src/modules/github/issue/graphql/mutations/batch-upsert';
import { dedupeEngineers } from 'src/modules/engineer/normalizers';
import { issueFromGraphql } from 'src/modules/github/issue/normalizers';
import { timed } from 'src/modules/shared/timing';

export type FetchIssuesFixturePage = {
  issues: GqlIssue[];
  totalCount: number;
  hasMore: boolean;
  endCursor: string | null;
};

type FetchIssuesPayload = {
  owner: string;
  repo: string;
  cursor?: string | null;
  fixturePage?: FetchIssuesFixturePage;
};

const handler = async (event: RoutePayload<FetchIssuesPayload>) => {
  const handlerStart = Date.now();
  const { owner, repo, cursor = null, fixturePage } = event.body ?? {};
  if (!owner || !repo) {
    return { error: 'owner and repo are required' };
  }

  const tag = `${owner}/${repo}${cursor ? `@${cursor.slice(0, 8)}` : ''}`;
  console.log(`[fetch-issues] start ${tag}${fixturePage ? ' (fixture)' : ''}`);

  const result = fixturePage
    ?? (await timed(`fetch-issues:github ${tag}`, () =>
      fetchIssuesGraphQL(owner, repo, cursor),
    ));
  const { issues, totalCount, hasMore, endCursor } = result;

  if (issues.length === 0) {
    console.log(`[fetch-issues] empty page for ${tag}`);
    return { issueCount: 0, totalCount, hasMore: false, endCursor: null };
  }

  const fullRepo = `${owner}/${repo}`;

  const engineerInputs = dedupeEngineers(issues.map((i) => i.author));
  const engineers = await timed(
    `fetch-issues:upsertEngineers ${tag} (${engineerInputs.length})`,
    () => batchUpsertEngineers(engineerInputs),
  );

  const idByLogin = new Map<string, string>();
  for (const eng of engineers) {
    if (eng.ghLogin) idByLogin.set(eng.ghLogin, eng.id);
  }

  const issueData = issues.map((issue) => ({
    ...issueFromGraphql(issue, fullRepo),
    authorId: issue.author ? (idByLogin.get(issue.author.login) ?? null) : null,
  }));

  await timed(
    `fetch-issues:upsertIssues ${tag} (${issueData.length})`,
    () => batchUpsertIssues(issueData),
  );

  const totalMs = Date.now() - handlerStart;
  console.log(
    `[fetch-issues] done ${tag} in ${totalMs}ms (issues=${issues.length}, hasMore=${hasMore})`,
  );

  return { issueCount: issues.length, totalCount, hasMore, endCursor };
};

export default defineLogicFunction({
  universalIdentifier: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
  name: 'fetch-issues',
  description:
    'Fetches one page of issues via GitHub GraphQL API and batch upserts them',
  timeoutSeconds: 300,
  handler,
  httpRouteTriggerSettings: {
    path: '/github/fetch-issues',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
