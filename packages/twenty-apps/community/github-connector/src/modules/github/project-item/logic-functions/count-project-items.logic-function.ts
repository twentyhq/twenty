import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  getGithubProjects,
  type GithubProject,
} from 'src/modules/github/connector/config';
import { countProjectItems } from 'src/modules/github/project-item/graphql/github/count-project-items';

const PAGE_SIZE = 100;

type CountProjectItemsPayload = {
  projects?: GithubProject[];
};

const handler = async (event: RoutePayload<CountProjectItemsPayload>) => {
  const bodyProjects = event.body?.projects;
  const projects =
    bodyProjects && bodyProjects.length > 0
      ? bodyProjects
      : getGithubProjects();

  const results: Array<GithubProject & { totalCount: number; pages: number }> =
    [];
  let totalPages = 0;

  for (const { owner, number } of projects) {
    const totalCount = await countProjectItems(owner, number);
    const pages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);
    results.push({ owner, number, totalCount, pages });
    totalPages += pages;
  }

  return { totalPages, projects: results };
};

export default defineLogicFunction({
  universalIdentifier: 'f7a3e1b2-5c4d-4e6f-8a9b-0d1c2e3f4a5b',
  name: 'count-project-items',
  description:
    'Counts total project item pages across configured projects using GraphQL totalCount',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/github/count-project-items',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
