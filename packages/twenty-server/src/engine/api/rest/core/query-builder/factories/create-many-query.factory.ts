import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared';

import { mapFieldMetadataToGraphqlQuery } from 'src/engine/api/rest/core/query-builder/utils/map-field-metadata-to-graphql-query.utils';

@Injectable()
export class CreateManyQueryFactory {
  create(objectMetadata, depth?: number): string {
    const objectNamePlural = capitalize(
      objectMetadata.objectMetadataItem.namePlural,
    );
    const objectNameSingular = capitalize(
      objectMetadata.objectMetadataItem.nameSingular,
    );

    return `
      mutation Create${objectNamePlural}($data: [${objectNameSingular}CreateInput!]) {
        create${objectNamePlural}(data: $data) {
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
      }
    `;
  }
}
