import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared';

import { mapFieldMetadataToGraphqlQuery } from 'src/engine/api/rest/core/query-builder/utils/map-field-metadata-to-graphql-query.utils';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

@Injectable()
export class FindManyQueryFactory {
  create(
    objectMetadata: {
      objectMetadataMaps: ObjectMetadataMaps;
      objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
    },
    depth?: number,
  ): string {
    const objectNameSingular = capitalize(
      objectMetadata.objectMetadataMapItem.nameSingular,
    );
    const objectNamePlural = objectMetadata.objectMetadataMapItem.namePlural;

    return `
      query FindMany${capitalize(objectNamePlural)}(
        $filter: ${objectNameSingular}FilterInput,
        $orderBy: [${objectNameSingular}OrderByInput],
        $startingAfter: String,
        $endingBefore: String,
        $first: Int,
        $last: Int
        ) {
        ${objectNamePlural}(
          filter: $filter,
          orderBy: $orderBy,
          first: $first,
          last: $last,
          after: $startingAfter,
          before: $endingBefore
        ) {
          edges {
            node {
              id
              ${objectMetadata.objectMetadataMapItem.fields
                .map((field) =>
                  mapFieldMetadataToGraphqlQuery(
                    objectMetadata.objectMetadataMaps,
                    field,
                    depth,
                  ),
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
          totalCount
        }
      }
    `;
  }
}
