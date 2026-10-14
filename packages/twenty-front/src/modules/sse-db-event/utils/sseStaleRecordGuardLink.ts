import { ApolloLink } from '@apollo/client';
import { map } from 'rxjs';

import { findNewerSseAppliedRecord } from '@/sse-db-event/utils/findNewerSseAppliedRecord';
import { patchStaleRecordNodes } from '@/sse-db-event/utils/patchStaleRecordNodes';
import { pruneExpiredSseAppliedRecordVersions } from '@/sse-db-event/utils/pruneExpiredSseAppliedRecordVersions';
import { sseAppliedRecordVersionsByCacheId } from '@/sse-db-event/utils/sseAppliedRecordVersionsByCacheId';
import { isPlainObject } from 'twenty-shared/utils';

export const sseStaleRecordGuardLink = new ApolloLink((operation, forward) =>
  forward(operation).pipe(
    map((result) => {
      pruneExpiredSseAppliedRecordVersions();

      if (
        sseAppliedRecordVersionsByCacheId.size === 0 ||
        !isPlainObject(result.data)
      ) {
        return result;
      }

      const patchedData = patchStaleRecordNodes({
        data: result.data,
        findNewerRecord: findNewerSseAppliedRecord,
      });

      return patchedData === result.data
        ? result
        : { ...result, data: patchedData };
    }),
  ),
);
