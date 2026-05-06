import { defineLogicFunction } from 'twenty-sdk/define';
import { type RoutePayload } from 'twenty-sdk/logic-function';
import { countAcrossRepos } from 'src/modules/github/connector/count-across-repos';
import { countContributors } from 'src/modules/github/contributor/graphql/github/count-contributors';

type CountContributorsPayload = {
  repos?: string[];
};

const handler = async (event: RoutePayload<CountContributorsPayload>) =>
  countAcrossRepos(event.body?.repos, countContributors, 'count-contributors');

export default defineLogicFunction({
  universalIdentifier: 'fe0a6f00-0d63-4cb9-9b3c-1d8186181830',
  name: 'count-contributors',
  description:
    'Counts contributors across configured repos and returns the per-repo page split.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/github/count-contributors',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
