import { Injectable } from '@nestjs/common';

import { capitalize } from 'src/utils/capitalize';
import { mapFieldMetadataToGraphqlQuery } from 'src/engine/api/rest/api-rest-query-builder/utils/map-field-metadata-to-graphql-query.utils';

@Injectable()
export class CreateQueryFactory {
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
