import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/requests/graphql-client.util";
import { CurrentWorkspaceMetadataType } from "src/logic-functions/types/current-workspace-metadata.type";

export const fetchCurrentWorkspace = async (client: AxiosInstance) => {
  const data = await postGraphql<CurrentWorkspaceMetadataType>(
    client,
    "/metadata",
    'CurrentWorkspaceMetadata',
    `query CurrentWorkspaceMetadata {
  currentWorkspace {
    billingSubscriptions {
      metadata
    }
  }
}`);

  return data.data.currentWorkspace.billingSubscriptions;
}