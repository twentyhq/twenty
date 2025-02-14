import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared';

import { mapFieldMetadataToGraphqlQuery } from 'src/engine/api/rest/core/query-builder/utils/map-field-metadata-to-graphql-query.utils';

@Injectable()
export class UpdateQueryFactory {
  create(objectMetadata, depth?: number): string {
    const objectNameSingular = objectMetadata.objectMetadataItem.nameSingular;

    return `
      mutation Update${capitalize(
        objectNameSingular,
      )}($id: ID!, $data: ${capitalize(objectNameSingular)}UpdateInput!) {
        update${capitalize(objectNameSingular)}(id: $id, data: $data) {
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
