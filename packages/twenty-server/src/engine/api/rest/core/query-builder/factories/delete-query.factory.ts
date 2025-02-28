import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

@Injectable()
export class DeleteQueryFactory {
  create(objectMetadataMapItem: ObjectMetadataItemWithFieldMaps): string {
    const objectNameSingular = capitalize(objectMetadataMapItem.nameSingular);

    return `
      mutation Delete${objectNameSingular}($id: ID!) {
        delete${objectNameSingular}(id: $id) {
          id
        }
      }
    `;
  }
}
