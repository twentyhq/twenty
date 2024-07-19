import { Injectable } from '@nestjs/common';

import { capitalize } from 'src/utils/capitalize';
import { fetchMetadataFields } from 'src/engine/api/rest/metadata/query-builder/utils/fetch-metadata-fields.utils';

@Injectable()
export class FindOneMetadataQueryFactory {
  create(objectNameSingular: string, objectNamePlural: string): string {
    const fields = fetchMetadataFields(objectNamePlural);

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
