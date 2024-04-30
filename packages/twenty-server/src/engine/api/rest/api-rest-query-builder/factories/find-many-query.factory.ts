import { Injectable } from '@nestjs/common';

import { capitalize } from 'src/utils/capitalize';
import { mapFieldMetadataToGraphqlQuery } from 'src/engine/api/rest/api-rest-query-builder/utils/map-field-metadata-to-graphql-query.utils';

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
        $orderBy: ${objectNameSingular}OrderByInput,
        $lastCursor: String,
        $limit: Int = 60
        ) {
        ${objectNamePlural}(
        filter: $filter, orderBy: $orderBy, first: $limit, after: $lastCursor
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
        }
      }
    `;
  }
}
