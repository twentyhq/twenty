import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared/utils';

@Injectable()
export class DeleteMetadataQueryFactory {
  create(objectNameSingular: string): string {
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
