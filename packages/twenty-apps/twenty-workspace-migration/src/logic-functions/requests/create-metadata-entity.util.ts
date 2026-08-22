import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/requests/graphql-client.util";

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

export const createManyMetadataEntities = async (
  client: AxiosInstance,
  operationName: string,
  argName: string,
  inputTypeName: string,
  data: Record<string, unknown>[],
): Promise<{ id: string }[]> => {
  const mutation = `mutation ${operationName}($${argName}: [${inputTypeName}!]!) {
  ${operationName}(${argName}: $${argName}) {
    id
  }
}`;

  const responseData = await postGraphql<Record<string, { id: string }[]>>(
    client,
    '/metadata',
    operationName,
    mutation,
    { [argName]: data },
  );

  return responseData[operationName];
}
