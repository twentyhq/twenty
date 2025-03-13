import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';
import { getSearchRecordsQueryResponseField } from '@/object-record/utils/getSearchRecordsQueryResponseField';
import { isUndefined } from '@sniptt/guards';
import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared';

export const generateCombinedSearchRecordsQuery = ({
  objectMetadataItems,
  operationSignatures,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  operationSignatures: RecordGqlOperationSignature[];
}) => {
  const filterPerMetadataItemArray = operationSignatures
    .map(
      ({ objectNameSingular }) =>
        `$filter${capitalize(objectNameSingular)}: ${capitalize(
          objectNameSingular,
        )}FilterInput`,
    )
    .join(', ');

  const limitPerMetadataItemArray = operationSignatures
    .map(
      ({ objectNameSingular }) =>
        `$limit${capitalize(objectNameSingular)}: Int`,
    )
    .join(', ');

  const queryKeyWithObjectMetadataItemArray = operationSignatures.map(
    (queryKey) => {
      const objectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular === queryKey.objectNameSingular,
      );

      if (isUndefined(objectMetadataItem)) {
        throw new Error(
          `Object metadata item not found for object name singular: ${queryKey.objectNameSingular}`,
        );
      }

      return { ...queryKey, objectMetadataItem };
    },
  );

  const filteredQueryKeyWithObjectMetadataItemArray =
    queryKeyWithObjectMetadataItemArray.filter(
      ({ objectMetadataItem }) => objectMetadataItem.isSearchable,
    );

  return gql`
    query CombinedSearchRecords(
      ${filterPerMetadataItemArray}, 
      ${limitPerMetadataItemArray},
      $search: String,
    ) {
      ${filteredQueryKeyWithObjectMetadataItemArray
        .map(
          ({ objectMetadataItem }) =>
            `${getSearchRecordsQueryResponseField(objectMetadataItem.namePlural)}(filter: $filter${capitalize(
              objectMetadataItem.nameSingular,
            )},
              limit: $limit${capitalize(objectMetadataItem.nameSingular)},
              searchInput: $search
            ){
          edges {
            node ${mapObjectMetadataToGraphQLQuery({
              objectMetadataItems: objectMetadataItems,
              objectMetadataItem,
            })}
            cursor
          }
          totalCount
        }`,
        )
        .join('\n')}
    }
  `;
};
