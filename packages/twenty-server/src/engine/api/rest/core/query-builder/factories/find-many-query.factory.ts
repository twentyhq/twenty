import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared';

import { mapFieldMetadataToGraphqlQuery } from 'src/engine/api/rest/core/query-builder/utils/map-field-metadata-to-graphql-query.utils';

@Injectable()
export class FindManyQueryFactory {
  create(objectMetadata, depth?: number): string {
    const objectNameSingular = capitalize(
      objectMetadata.objectMetadataItem.nameSingular,
    );
    const objectNamePlural = objectMetadata.objectMetadataItem.namePlural;

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
              ${objectMetadata.objectMetadataItem.fields
                .map((field) =>
                  mapFieldMetadataToGraphqlQuery(
                    objectMetadata.objectMetadataItems,
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
