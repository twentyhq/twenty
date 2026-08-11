import { type AxiosInstance } from "axios";
import { CreateOneObjectType } from "src/logic-functions/types/create-one-object.type";
import { postGraphql } from "src/logic-functions/data/targetWorkspace/graphql-client.util";

const MUTATION = `mutation createOneObject($input: CreateOneObjectInput!) {
  createOneObject(input: $input) {
    id
    universalIdentifier
    fieldsList {
      id
      name
      universalIdentifier
    }
  }
}`;

export type CreatedObjectType = {
  id: string;
  universalIdentifier: string;
  fieldsList: { id: string; name: string; universalIdentifier: string }[];
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
        object: {
          nameSingular: object.nameSingular,
          namePlural: object.namePlural,
          labelSingular: object.labelSingular,
          labelPlural: object.labelPlural,
          description: object.description,
          icon: object.icon,
          color: object.color,
          isLabelSyncedWithName: object.isLabelSyncedWithName,
          skipNameField: object.skipNameField,
        },
      },
    },
  );

  return data.createOneObject;
}
