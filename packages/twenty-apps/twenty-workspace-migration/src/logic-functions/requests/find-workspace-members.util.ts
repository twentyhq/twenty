import type { AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/requests/graphql-client.util";
import { FindWorkspaceMembersType } from "src/logic-functions/types/workspace-members.type";

export const FindWorkspaceMembers = async (
  client: AxiosInstance,
): Promise<FindWorkspaceMembersType> => {
  const data = await postGraphql<FindWorkspaceMembersType['data']>(
    client,
    '/graphql',
    'findWorkspaceMembers',
    `query FindWorkspaceMembers {
  workspaceMembers {
    edges {
      node {
        id
        userEmail
      }
    }
  }
}`,
  );

  return { data };
}