import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared';

import { fetchMetadataFields } from 'src/engine/api/rest/metadata/query-builder/utils/fetch-metadata-fields.utils';

@Injectable()
export class CreateMetadataQueryFactory {
  create(objectNameSingular: string, objectNamePlural: string): string {
    const objectNameCapitalized = capitalize(objectNameSingular);

    const fields = fetchMetadataFields(objectNamePlural);

    return `
      mutation Create${objectNameCapitalized}($input: CreateOne${objectNameCapitalized}${
        objectNameSingular === 'field' ? 'Metadata' : ''
      }Input!) {
        createOne${objectNameCapitalized}(input: $input) {
          id
          ${fields}
        }
      }
    `;
  }
}
