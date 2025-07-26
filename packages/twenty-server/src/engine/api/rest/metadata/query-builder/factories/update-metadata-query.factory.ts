import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared/utils';

import { fetchMetadataFields } from 'src/engine/api/rest/metadata/query-builder/utils/fetch-metadata-fields.utils';
import {
  ObjectName,
  Singular,
} from 'src/engine/api/rest/metadata/types/metadata-entity.type';
import { Selectors } from 'src/engine/api/rest/metadata/types/metadata-query.type';

@Injectable()
export class UpdateMetadataQueryFactory {
  create(
    objectNameSingular: Singular<ObjectName>,
    objectNamePlural: ObjectName,
    selectors: Selectors,
  ): string {
    const objectNameCapitalized = capitalize(objectNameSingular);

    const fields = fetchMetadataFields(objectNamePlural, selectors);

    return `
      mutation Update${objectNameCapitalized}($input: UpdateOne${objectNameCapitalized}${
        objectNameSingular === 'field' ? 'Metadata' : ''
      }Input!) {
        updateOne${objectNameCapitalized}(input: $input) {
          id
          ${fields}
        }
      }
    `;
  }
}
