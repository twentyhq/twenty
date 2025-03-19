import { Injectable } from '@nestjs/common';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { capitalize } from 'twenty-shared/utils';

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
