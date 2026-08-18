import { type AxiosInstance } from "axios";
import { UpdateOneFieldType } from "src/logic-functions/types/update-one-field.type";
import { postGraphql } from "src/logic-functions/requests/graphql-client.util";

const MUTATION = `mutation updateOneField($input: UpdateOneFieldMetadataInput!) {
  updateOneField(input: $input) {
    id
  }
}`;

export const updateOneField = async (
  client: AxiosInstance,
  update: UpdateOneFieldType,
): Promise<{ id: string }> => {
  const data = await postGraphql<{ updateOneField: { id: string } }>(
    client,
    '/metadata',
    'updateOneField',
    MUTATION,
    {
      input: {
        id: update.id,
        update: {
          defaultValue: update.field.defaultValue,
          description: update.field.description,
          icon: update.field.icon,
          isActive: update.field.isActive,
          isLabelSyncedWithName: update.field.isLabelSyncedWithName,
          isNullable: update.field.isNullable,
          isSystem: update.field.isSystem,
          isUIEditable: update.field.isUIEditable,
          isUIReadOnly: update.field.isUIReadOnly,
          isUnique: update.field.isUnique,
          label: update.field.label,
          name: update.field.name,
          options: update.field.options,
          settings: update.field.settings,
        },
      },
    },
  );

  return data.updateOneField;
}
