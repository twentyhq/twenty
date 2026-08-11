import { type AxiosInstance } from "axios";
import { UpdateOneObjectType } from "src/logic-functions/types/update-one-object.type";
import { postGraphql } from "src/logic-functions/data/targetWorkspace/graphql-client.util";

const MUTATION = `mutation updateOneObject($input: UpdateOneObjectInput!) {
  updateOneObject(input: $input) {
    id
  }
}`;

export const updateOneObject = async (
  client: AxiosInstance,
  id: string,
  update: UpdateOneObjectType,
): Promise<{ id: string }> => {
  const data = await postGraphql<{ updateOneObject: { id: string } }>(
    client,
    '/metadata',
    'updateOneObject',
    MUTATION,
    {
      input: {
        id,
        update: {
          color: update.color,
          description: update.description,
          icon: update.icon,
          isActive: update.isActive,
          isLabelSyncedWithName: update.isLabelSyncedWithName,
          labelIdentifierFieldMetadataId: update.labelIdentifierFieldMetadataId,
          labelPlural: update.labelPlural,
          labelSingular: update.labelSingular,
          namePlural: update.namePlural,
          nameSingular: update.nameSingular,
          openRecordIn: update.openRecordIn,
        },
      },
    },
  );

  return data.updateOneObject;
}
