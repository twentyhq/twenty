import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared';

import { mapFieldMetadataToGraphqlQuery } from 'src/engine/api/rest/core/query-builder/utils/map-field-metadata-to-graphql-query.utils';

@Injectable()
export class CreateOneQueryFactory {
  create(objectMetadata, depth?: number): string {
    const objectNameSingular = capitalize(
      objectMetadata.objectMetadataItem.nameSingular,
    );

    return `
      mutation Create${objectNameSingular}($data: ${objectNameSingular}CreateInput!) {
        create${objectNameSingular}(data: $data) {
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
