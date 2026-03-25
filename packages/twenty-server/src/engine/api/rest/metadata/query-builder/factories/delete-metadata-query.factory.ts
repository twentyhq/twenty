import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared/utils';

import {
  type ObjectName,
  type Singular,
} from 'src/engine/api/rest/metadata/types/metadata-entity.type';

@Injectable()
export class DeleteMetadataQueryFactory {
  create(objectNameSingular: Singular<ObjectName>): string {
    const objectNameCapitalized = capitalize(objectNameSingular);
    const formattedObjectName =
      objectNameCapitalized === 'RelationMetadata'
        ? 'Relation'
        : objectNameCapitalized;

    return `
      mutation Delete${objectNameCapitalized}($input: DeleteOne${formattedObjectName}Input!) {
        deleteOne${formattedObjectName}(input: $input) {
          id
        }
      }
    `;
  }
}
