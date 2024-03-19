import { gql } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { isNonEmptyArray } from '~/utils/isNonEmptyArray';
import { capitalize } from '~/utils/string/capitalize';

export const useGenerateFindManyRecordsForMultipleMetadataItemsQuery = ({
  objectMetadataItems,
  depth,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  depth?: number;
}) => {
  const allObjectMetadataItems = useRecoilValue(objectMetadataItemsState());
  const capitalizedObjectNameSingulars = objectMetadataItems.map(
    ({ nameSingular }) => capitalize(nameSingular),
  );

  if (!isNonEmptyArray(capitalizedObjectNameSingulars)) {
    return null;
  }

  const filterPerMetadataItemArray = capitalizedObjectNameSingulars
    .map(
      (capitalizedObjectNameSingular) =>
        `$filter${capitalizedObjectNameSingular}: ${capitalizedObjectNameSingular}FilterInput`,
    )
    .join(', ');

  const orderByPerMetadataItemArray = capitalizedObjectNameSingulars
    .map(
      (capitalizedObjectNameSingular) =>
        `$orderBy${capitalizedObjectNameSingular}: ${capitalizedObjectNameSingular}OrderByInput`,
    )
    .join(', ');

  const lastCursorPerMetadataItemArray = capitalizedObjectNameSingulars
    .map(
      (capitalizedObjectNameSingular) =>
        `$lastCursor${capitalizedObjectNameSingular}: String`,
    )
    .join(', ');

  const limitPerMetadataItemArray = capitalizedObjectNameSingulars
    .map(
      (capitalizedObjectNameSingular) =>
        `$limit${capitalizedObjectNameSingular}: Float`,
    )
    .join(', ');

  return gql`
    query FindManyRecordsMultipleMetadataItems(
      ${filterPerMetadataItemArray}, 
      ${orderByPerMetadataItemArray}, 
      ${lastCursorPerMetadataItemArray}, 
      ${limitPerMetadataItemArray}
    ) {
      ${objectMetadataItems
        .map(
          (objectMetadataItem) =>
            `${objectMetadataItem.namePlural}(filter: $filter${capitalize(
              objectMetadataItem.nameSingular,
            )}, orderBy: $orderBy${capitalize(
              objectMetadataItem.nameSingular,
            )}, first: $limit${capitalize(
              objectMetadataItem.nameSingular,
            )}, after: $lastCursor${capitalize(
              objectMetadataItem.nameSingular,
            )}){
          edges {
            node ${mapObjectMetadataToGraphQLQuery({
              objectMetadataItems: allObjectMetadataItems,
              objectMetadataItem,
              depth,
            })}
            cursor
          }
          pageInfo {
            hasNextPage
            startCursor
            endCursor
          }
          totalCount
        }`,
        )
        .join('\n')}
    }
  `;
};
