import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/data/targetWorkspace/graphql-client.util";

// Shared by every /metadata "create one" mutation whose input type name is known statically
// (createView, createViewField, createViewFilter, createViewSort, createViewGroup,
// createViewFilterGroup, createViewFieldGroup, createNavigationMenuItem, createSkill,
// createWebhook, createOneRole) - they're all structurally identical: one named input,
// `{ id }` returned. `argName` differs per mutation (most use `input`, but e.g. createOneRole
// uses `createRoleInput`), so it's a parameter rather than assumed.
export const createMetadataEntity = async (
  client: AxiosInstance,
  operationName: string,
  argName: string,
  inputTypeName: string,
  data: Record<string, unknown>,
): Promise<{ id: string }> => {
  const mutation = `mutation ${operationName}($${argName}: ${inputTypeName}!) {
  ${operationName}(${argName}: $${argName}) {
    id
  }
}`;

  const responseData = await postGraphql<Record<string, { id: string }>>(
    client,
    '/metadata',
    operationName,
    mutation,
    { [argName]: data },
  );

  return responseData[operationName];
}
