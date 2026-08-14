import { type AxiosInstance } from "axios";
import { CreateOneObjectType } from "src/logic-functions/types/create-one-object.type";
import { postGraphql } from "src/logic-functions/data/targetWorkspace/graphql-client.util";

const MUTATION = `mutation createOneObject($input: CreateOneObjectInput!) {
  createOneObject(input: $input) {
    id
    nameSingular
    universalIdentifier
  }
}`;

export type CreatedObjectType = {
  id: string;
  nameSingular: string;
  universalIdentifier: string;
};

// Only the fields CreateObjectInput actually accepts are sent, regardless of what
// extra properties the caller's object literal happens to carry (e.g. from a spread).
export const createOneObject = async (
  client: AxiosInstance,
  object: CreateOneObjectType,
): Promise<CreatedObjectType> => {
  const data = await postGraphql<{ createOneObject: CreatedObjectType }>(
    client,
    '/metadata',
    'createOneObject',
    MUTATION,
    {
      input: {
        object,
      },
    },
  );

  return data.createOneObject;
}
