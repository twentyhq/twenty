import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared';

import { mapFieldMetadataToGraphqlQuery } from 'src/engine/api/rest/core/query-builder/utils/map-field-metadata-to-graphql-query.utils';

@Injectable()
export class FindDuplicatesQueryFactory {
  create(objectMetadata, depth?: number): string {
    const objectNameSingular = objectMetadata.objectMetadataItem.nameSingular;

    return `
      query FindDuplicate${capitalize(
        objectNameSingular,
      )}($ids: [ID], $data: [${capitalize(objectNameSingular)}CreateInput]) {
        ${objectNameSingular}Duplicates(ids: $ids, data: $data) {
          totalCount
          pageInfo {
            hasNextPage
            startCursor
            endCursor
          }
          edges{
            node {
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
          }
        }
      }
    `;
  }
}
