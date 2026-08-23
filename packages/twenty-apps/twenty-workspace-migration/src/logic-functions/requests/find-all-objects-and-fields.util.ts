import { type AxiosInstance } from "axios";
import { FindObjectsFieldsType, ObjectType } from "src/logic-functions/types/find-objects-fields.type";
import { postGraphql } from "src/logic-functions/requests/graphql-client.util";

const OBJECTS_PAGE_SIZE = 1000;

type ObjectsPage = {
  objects: {
    edges: { node: ObjectType }[];
    pageInfo: { endCursor: string | null; hasNextPage: boolean };
  };
};

const buildQuery = (after: string | null) => `query findObjectsAndFields {
  objects(paging: {first: ${OBJECTS_PAGE_SIZE}${after !== null ? `, after: ${JSON.stringify(after)}` : ''}}) {
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
        isSystem
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
          morphRelations {
            type
            targetFieldMetadata {
              label
              icon
            }
            targetObjectMetadata {
              nameSingular
            }
          }
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
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}`;

export const FindAllObjectsAndFields = async (
  client: AxiosInstance,
): Promise<FindObjectsFieldsType> => {
  const edges: { node: ObjectType }[] = [];
  let after: string | null = null;

  while (true) {
    const page: ObjectsPage = await postGraphql<ObjectsPage>(
      client,
      '/metadata',
      'findObjectsAndFields',
      buildQuery(after),
    );

    edges.push(...page.objects.edges);

    // A null cursor alongside hasNextPage would re-request page one forever, so it ends the
    // walk too rather than spinning until the function times out.
    if (page.objects.pageInfo.hasNextPage === false || page.objects.pageInfo.endCursor === null) {
      return { data: { objects: { edges } } };
    }
    after = page.objects.pageInfo.endCursor;
  }
}
