import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { countAcrossRepos } from 'src/modules/github/connector/count-across-repos';
import { countIssues } from 'src/modules/github/issue/graphql/github/count-issues';

type CountIssuesPayload = {
  repos?: string[];
};

const handler = async (event: RoutePayload<CountIssuesPayload>) =>
  countAcrossRepos(event.body?.repos, countIssues, 'count-issues');

export default defineLogicFunction({
  universalIdentifier: 'd8cc32bf-6be9-44fc-920a-8bba510f045f',
  name: 'count-issues',
  description:
    'Counts total issue pages across configured repos using GraphQL totalCount',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/github/count-issues',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
