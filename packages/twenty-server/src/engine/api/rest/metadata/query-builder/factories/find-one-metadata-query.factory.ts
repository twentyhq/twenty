import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared/utils';

import { fetchMetadataFields } from 'src/engine/api/rest/metadata/query-builder/utils/fetch-metadata-fields.utils';
import {
  type ObjectName,
  type Singular,
} from 'src/engine/api/rest/metadata/types/metadata-entity.type';
import { type Selectors } from 'src/engine/api/rest/metadata/types/metadata-query.type';

@Injectable()
export class FindOneMetadataQueryFactory {
  create(
    objectNameSingular: Singular<ObjectName>,
    objectNamePlural: ObjectName,
    selectors: Selectors,
  ): string {
    const fields = fetchMetadataFields(objectNamePlural, selectors);

    return `
      query FindOne${capitalize(objectNameSingular)}(
        $id: UUID!,
        ) {
        ${objectNameSingular}(id: $id) {
          id
          ${fields}
        }
      }
    `;
  }
}
