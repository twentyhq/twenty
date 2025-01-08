import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared';

import { fetchMetadataFields } from 'src/engine/api/rest/metadata/query-builder/utils/fetch-metadata-fields.utils';

@Injectable()
export class FindManyMetadataQueryFactory {
  create(objectNamePlural): string {
    const fields = fetchMetadataFields(objectNamePlural);

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
