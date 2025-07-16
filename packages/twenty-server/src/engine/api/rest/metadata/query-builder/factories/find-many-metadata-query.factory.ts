import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared/utils';

import { fetchMetadataFields } from 'src/engine/api/rest/metadata/query-builder/utils/fetch-metadata-fields.utils';
import { ObjectName } from 'src/engine/api/rest/metadata/types/metadata-entity.type';
import { Selectors } from 'src/engine/api/rest/metadata/types/metadata-query.type';

@Injectable()
export class FindManyMetadataQueryFactory {
  create(objectNamePlural: ObjectName, selectors: Selectors): string {
    const fields = fetchMetadataFields(objectNamePlural, selectors);

    return `
      query FindMany${capitalize(objectNamePlural)}(
        $paging: CursorPaging!
      ) {
        ${objectNamePlural}(
          paging: $paging
        ) {
          edges {
            node {
              id
              ${fields}
            }
          }
          pageInfo {
            hasNextPage
            startCursor
            endCursor
          }
        }
      }
    `;
  }
}
