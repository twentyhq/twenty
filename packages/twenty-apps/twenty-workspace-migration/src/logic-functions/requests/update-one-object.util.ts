import { type AxiosInstance } from "axios";
import { UpdateOneObjectType } from "src/logic-functions/types/update-one-object.type";
import { postGraphql } from "src/logic-functions/requests/graphql-client.util";

const MUTATION = `mutation updateOneObject($input: UpdateOneObjectInput!) {
  updateOneObject(input: $input) {
    id
  }
}`;

export const updateOneObject = async (
  client: AxiosInstance,
  update: UpdateOneObjectType,
): Promise<{ id: string }> => {
  const data = await postGraphql<{ updateOneObject: { id: string } }>(
    client,
    '/metadata',
    'updateOneObject',
    MUTATION,
    {
      input: {
        id: update.id,
        update: {
          color: update.object.color,
          description: update.object.description,
          icon: update.object.icon,
          isActive: update.object.isActive,
          isLabelSyncedWithName: update.object.isLabelSyncedWithName,
          labelIdentifierFieldMetadataId: update.object.labelIdentifierFieldMetadataId,
          labelPlural: update.object.labelPlural,
          labelSingular: update.object.labelSingular,
          namePlural: update.object.namePlural,
          nameSingular: update.object.nameSingular,
          openRecordIn: update.object.openRecordIn,
        },
      },
    },
  );

  return data.updateOneObject;
}
