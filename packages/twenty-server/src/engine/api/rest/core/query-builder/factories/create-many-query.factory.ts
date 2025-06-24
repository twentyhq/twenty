import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared/utils';

import { mapFieldMetadataToGraphqlQuery } from 'src/engine/api/rest/core/query-builder/utils/map-field-metadata-to-graphql-query.utils';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

@Injectable()
export class CreateManyQueryFactory {
  create(
    objectMetadata: {
      objectMetadataMaps: ObjectMetadataMaps;
      objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
    },
    depth?: number,
  ): string {
    const objectNamePlural = capitalize(
      objectMetadata.objectMetadataMapItem.namePlural,
    );
    const objectNameSingular = capitalize(
      objectMetadata.objectMetadataMapItem.nameSingular,
    );

    return `
      mutation Create${objectNamePlural}($data: [${objectNameSingular}CreateInput!]) {
        create${objectNamePlural}(data: $data) {
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
