import { type AxiosInstance } from "axios";
import { CreateOneObjectType } from "src/logic-functions/types/create-one-object.type";
import { postGraphql } from "src/logic-functions/requests/graphql-client.util";

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
