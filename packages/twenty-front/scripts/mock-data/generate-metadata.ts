/* eslint-disable no-console */
import { graphqlRequest, writeGeneratedFile } from './utils.js';

// Apollo Client automatically adds __typename to every object level;
// raw fetch does not, so we include it explicitly here.
const METADATA_QUERY = `
  query ObjectMetadataItems {
    objects(paging: { first: 1000 }) {
      __typename
      edges {
        __typename
        node {
          __typename
          id
          universalIdentifier
          nameSingular
          namePlural
          labelSingular
          labelPlural
          description
          icon
          isCustom
          isRemote
          isActive
          isSystem
          isUIReadOnly
          createdAt
          updatedAt
          labelIdentifierFieldMetadataId
          imageIdentifierFieldMetadataId
          applicationId
          shortcut
          isLabelSyncedWithName
          isSearchable
          duplicateCriteria
          indexMetadataList {
            __typename
            id
            createdAt
            updatedAt
            name
            indexWhereClause
            indexType
            isUnique
            isCustom
            indexFieldMetadataList {
              __typename
              id
              fieldMetadataId
              createdAt
              updatedAt
              order
            }
          }
          fieldsList {
            __typename
            id
            universalIdentifier
            type
            name
            label
            description
            icon
            isCustom
            isActive
            isSystem
            isUIReadOnly
            isNullable
            isUnique
            createdAt
            updatedAt
            defaultValue
            options
            settings
            isLabelSyncedWithName
            morphId
            applicationId
            relation {
              __typename
              type
              sourceObjectMetadata {
                __typename
                id
                nameSingular
                namePlural
              }
              targetObjectMetadata {
                __typename
                id
                nameSingular
                namePlural
              }
              sourceFieldMetadata {
                __typename
                id
                name
              }
              targetFieldMetadata {
                __typename
                id
                name
              }
            }
            morphRelations {
              __typename
              type
              sourceObjectMetadata {
                __typename
                id
                nameSingular
                namePlural
              }
              targetObjectMetadata {
                __typename
                id
                nameSingular
                namePlural
              }
              sourceFieldMetadata {
                __typename
                id
                name
              }
              targetFieldMetadata {
                __typename
                id
                name
              }
            }
          }
        }
      }
      pageInfo {
        __typename
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const generateMetadata = async (token: string) => {
  console.log('Fetching object metadata from /metadata ...');

  const metadata = await graphqlRequest('/metadata', METADATA_QUERY, token);

  writeGeneratedFile(
    'metadata/objects/mock-objects-metadata.ts',
    'mockedStandardObjectMetadataQueryResult',
    'ObjectMetadataItemsQuery',
    "import { ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';",
    metadata,
  );

  return metadata as {
    objects: { edges: { node: Record<string, unknown> }[] };
  };
};
