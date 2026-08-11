import { type AxiosInstance } from "axios";
import { CreateOneFieldType } from "src/logic-functions/types/create-one-field.type";
import { postGraphql } from "src/logic-functions/data/targetWorkspace/graphql-client.util";

const MUTATION = `mutation createOneField($input: CreateOneFieldMetadataInput!) {
  createOneField(input: $input) {
    id
    name
    universalIdentifier
  }
}`;

export type CreatedFieldType = {
  id: string;
  name: string;
  universalIdentifier: string;
};

export const createOneField = async (
  client: AxiosInstance,
  field: CreateOneFieldType,
): Promise<CreatedFieldType> => {
  const data = await postGraphql<{ createOneField: CreatedFieldType }>(
    client,
    '/metadata',
    'createOneField',
    MUTATION,
    {
      input: {
        field: {
          objectMetadataId: field.objectMetadataId,
          type: field.type,
          name: field.name,
          label: field.label,
          description: field.description,
          icon: field.icon,
          isActive: field.isActive,
          isNullable: field.isNullable,
          isUnique: field.isUnique,
          isUIEditable: field.isUIEditable,
          isUIReadOnly: field.isUIReadOnly,
          isLabelSyncedWithName: field.isLabelSyncedWithName,
          defaultValue: field.defaultValue,
          options: field.options,
          settings: field.settings,
          relationCreationPayload: field.relationCreationPayload,
          morphRelationsCreationPayload: field.morphRelationsCreationPayload,
        },
      },
    },
  );

  return data.createOneField;
}
