import type { AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/requests/graphql-client.util";
import { FindWorkspaceMembersType, WorkspaceMember } from "src/logic-functions/types/workspace-members.type";
import { PAGE_SIZE } from "src/constants/page-size";

type WorkspaceMembersPage = {
  workspaceMembers: {
    edges: { node: WorkspaceMember }[];
    pageInfo: { endCursor: string | null; hasNextPage: boolean };
  };
};

const buildQuery = (after: string | null) => `query FindWorkspaceMembers {
  workspaceMembers(first: ${PAGE_SIZE}${after !== null ? `, after: ${JSON.stringify(after)}` : ''}) {
    edges {
      node {
        id
        userEmail
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}`;

export const FindWorkspaceMembers = async (
  client: AxiosInstance,
): Promise<FindWorkspaceMembersType> => {
  const edges: { node: WorkspaceMember }[] = [];
  let after: string | null = null;

  while (true) {
    const page: WorkspaceMembersPage = await postGraphql<WorkspaceMembersPage>(
      client,
      '/graphql',
      'findWorkspaceMembers',
      buildQuery(after),
    );

    edges.push(...page.workspaceMembers.edges);

    if (page.workspaceMembers.pageInfo.hasNextPage === false || page.workspaceMembers.pageInfo.endCursor === null) {
      return { data: { workspaceMembers: { edges } } };
    }
    after = page.workspaceMembers.pageInfo.endCursor;
  }
}
