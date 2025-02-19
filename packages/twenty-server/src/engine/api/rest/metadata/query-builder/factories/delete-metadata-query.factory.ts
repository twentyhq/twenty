import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared';

@Injectable()
export class DeleteMetadataQueryFactory {
  create(objectNameSingular: string): string {
    const objectNameCapitalized = capitalize(objectNameSingular);

    return `
      mutation Delete${objectNameCapitalized}($input: DeleteOne${objectNameCapitalized}Input!) {
        deleteOne${objectNameCapitalized}(input: $input) {
          id
        }
      }
    `;
  }
}
