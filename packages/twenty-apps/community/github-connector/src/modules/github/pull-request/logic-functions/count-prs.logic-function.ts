import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { countAcrossRepos } from 'src/modules/github/connector/count-across-repos';
import { countPullRequests } from 'src/modules/github/pull-request/graphql/github/count-pull-requests';

type CountPrsPayload = {
  repos?: string[];
};

const handler = async (event: RoutePayload<CountPrsPayload>) =>
  countAcrossRepos(event.body?.repos, countPullRequests, 'count-prs');

export default defineLogicFunction({
  universalIdentifier: '082227ae-2acc-4320-8d31-62ad6c443da6',
  name: 'count-prs',
  description:
    'Counts total PR pages across configured repos using GraphQL totalCount',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/github/count-prs',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
