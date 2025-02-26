import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared';

import { mapFieldMetadataToGraphqlQuery } from 'src/engine/api/rest/core/query-builder/utils/map-field-metadata-to-graphql-query.utils';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

@Injectable()
export class UpdateQueryFactory {
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
      mutation Update${capitalize(
        objectNameSingular,
      )}($id: ID!, $data: ${capitalize(objectNameSingular)}UpdateInput!) {
        update${capitalize(objectNameSingular)}(id: $id, data: $data) {
          id
          ${Object.values(objectMetadata.objectMetadataMapItem.fieldsById)
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
