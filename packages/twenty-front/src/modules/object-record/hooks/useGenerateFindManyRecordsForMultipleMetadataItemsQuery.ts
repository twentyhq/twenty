import { gql } from '@apollo/client';

import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isNonEmptyArray } from '~/utils/isNonEmptyArray';
import { capitalize } from '~/utils/string/capitalize';

export const useGenerateFindManyRecordsForMultipleMetadataItemsQuery = ({
  objectMetadataItems,
  depth,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  depth?: number;
}) => {
  const mapFieldMetadataToGraphQLQuery = useMapFieldMetadataToGraphQLQuery();

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
        `$limit${capitalizedObjectNameSingular}: Float = 5`,
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
          ({ namePlural, nameSingular, fields }) =>
            `${namePlural}(filter: $filter${capitalize(
              nameSingular,
            )}, orderBy: $orderBy${capitalize(
              nameSingular,
            )}, first: $limit${capitalize(
              nameSingular,
            )}, after: $lastCursor${capitalize(nameSingular)}){
          edges {
            node {
              id
              ${fields
                .map((field) =>
                  mapFieldMetadataToGraphQLQuery({
                    field,
                    maxDepthForRelations: depth,
                  }),
                )
                .join('\n')}
            }
            cursor
          }
          pageInfo {
            hasNextPage
            startCursor
            endCursor
          }
        }`,
        )
        .join('\n')}
    }
  `;
};
