import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared';

import { mapFieldMetadataToGraphqlQuery } from 'src/engine/api/rest/core/query-builder/utils/map-field-metadata-to-graphql-query.utils';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

@Injectable()
export class FindOneQueryFactory {
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
      query FindOne${capitalize(objectNameSingular)}(
        $filter: ${capitalize(objectNameSingular)}FilterInput!,
        ) {
        ${objectNameSingular}(filter: $filter) {
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
      }
    `;
  }
}
