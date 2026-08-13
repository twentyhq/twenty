import { type AxiosInstance } from "axios";
import { FindObjectsFieldsType } from "src/logic-functions/types/find-objects-fields.type";
import { postGraphql } from "src/logic-functions/data/targetWorkspace/graphql-client.util";

// TODO: add morphRelations
const QUERY = `query findObjectsAndFields {
  objects(paging: {first: 1000}) {
    edges {
      node {
        applicationId
        color
        description
        icon
        universalIdentifier
        id
        isActive
        isLabelSyncedWithName
        labelIdentifierFieldMetadataId
        labelPlural
        labelSingular
        namePlural
        nameSingular
        openRecordIn
        fieldsList {
          applicationId
          defaultValue
          description
          icon
          id
          isActive
          isLabelSyncedWithName
          isNullable
          isSystem
          isUIEditable
          isUnique
          isUIReadOnly
          label
          morphId
          name
          objectMetadataId
          options
          relation {
            type
            targetFieldMetadata {
              label
              icon
            }
            targetObjectMetadata {
              nameSingular
            }
          }
          settings
          type
          universalIdentifier
        }
      }
    }
  }
}`;

export const FindAllObjectsAndFields = async (
  client: AxiosInstance,
): Promise<FindObjectsFieldsType> => {
  const data = await postGraphql<FindObjectsFieldsType['data']>(
    client,
    '/metadata',
    'findObjectsAndFields',
    QUERY,
  );

  return { data };
}
