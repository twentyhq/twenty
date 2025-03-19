import { Injectable } from '@nestjs/common';

import { mapFieldMetadataToGraphqlQuery } from 'src/engine/api/rest/core/query-builder/utils/map-field-metadata-to-graphql-query.utils';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { capitalize } from 'twenty-shared/utils';

@Injectable()
export class CreateOneQueryFactory {
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

    return `
      mutation Create${objectNameSingular}($data: ${objectNameSingular}CreateInput!) {
        create${objectNameSingular}(data: $data) {
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
