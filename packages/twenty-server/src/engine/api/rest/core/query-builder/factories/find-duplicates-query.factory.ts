import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared';

import { mapFieldMetadataToGraphqlQuery } from 'src/engine/api/rest/core/query-builder/utils/map-field-metadata-to-graphql-query.utils';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

@Injectable()
export class FindDuplicatesQueryFactory {
  create(
    objectMetadata: {
      objectMetadataMaps: ObjectMetadataMaps;
      objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
    },
    depth?: number,
  ): string {
    const objectNameSingular =
      objectMetadata.objectMetadataMapItem.nameSingular;

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
          }
        }
      }
    `;
  }
}
