import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { fetchProjectItemCount } from 'src/modules/github/connector/graphql';
import {
  getDefaultGithubOrg,
  getGithubProjectNumbers,
} from 'src/modules/github/connector/config';

const PAGE_SIZE = 100;

type CountProjectItemsPayload = {
  org?: string;
  projectNumbers?: number[];
};

const handler = async (event: RoutePayload<CountProjectItemsPayload>) => {
  const org = event.body?.org ?? getDefaultGithubOrg();
  const projectNumbers =
    event.body?.projectNumbers ?? getGithubProjectNumbers();

  const projects: Array<{
    projectNumber: number;
    totalCount: number;
    pages: number;
  }> = [];
  let totalPages = 0;

  for (const projectNumber of projectNumbers) {
    const totalCount = await fetchProjectItemCount(org, projectNumber);
    const pages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);
    projects.push({ projectNumber, totalCount, pages });
    totalPages += pages;
  }

  return { totalPages, org, projects };
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
