import { type AxiosInstance } from "axios";
import { UpdateOneFieldType } from "src/logic-functions/types/update-one-field.type";
import { postGraphql } from "src/logic-functions/data/targetWorkspace/graphql-client.util";

const MUTATION = `mutation updateOneField($input: UpdateOneFieldMetadataInput!) {
  updateOneField(input: $input) {
    id
  }
}`;

export const updateOneField = async (
  client: AxiosInstance,
  id: string,
  update: UpdateOneFieldType,
): Promise<{ id: string }> => {
  const data = await postGraphql<{ updateOneField: { id: string } }>(
    client,
    '/metadata',
    'updateOneField',
    MUTATION,
    {
      input: {
        id,
        update: {
          defaultValue: update.defaultValue,
          description: update.description,
          icon: update.icon,
          isActive: update.isActive,
          isLabelSyncedWithName: update.isLabelSyncedWithName,
          isNullable: update.isNullable,
          isSystem: update.isSystem,
          isUIEditable: update.isUIEditable,
          isUIReadOnly: update.isUIReadOnly,
          isUnique: update.isUnique,
          label: update.label,
          name: update.name,
          options: update.options,
          settings: update.settings,
        },
      },
    },
  );

  return data.updateOneField;
}
