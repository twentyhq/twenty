import { ApolloLink } from '@apollo/client';
import { type Store } from 'jotai/vanilla/store';
import { map } from 'rxjs';

import { sseAppliedRecordVersionsByCacheIdState } from '@/sse-db-event/states/sseAppliedRecordVersionsByCacheIdState';
import { findNewerSseAppliedRecord } from '@/sse-db-event/utils/findNewerSseAppliedRecord';
import { patchStaleRecordNodes } from '@/sse-db-event/utils/patchStaleRecordNodes';
import { isPlainObject } from 'twenty-shared/utils';

export const createSseStaleRecordGuardLink = ({ store }: { store: Store }) =>
  new ApolloLink((operation, forward) =>
    forward(operation).pipe(
      map((result) => {
        const sseAppliedRecordVersionsByCacheId = store.get(
          sseAppliedRecordVersionsByCacheIdState.atom,
        );

        if (
          Object.keys(sseAppliedRecordVersionsByCacheId).length === 0 ||
          !isPlainObject(result.data)
        ) {
          return result;
        }

        const nowInMs = Date.now();

        const patchedData = patchStaleRecordNodes({
          data: result.data,
          findNewerRecord: ({ cacheId, updatedAt }) =>
            findNewerSseAppliedRecord({
              sseAppliedRecordVersionsByCacheId,
              cacheId,
              updatedAt,
              nowInMs,
            }),
        });

        return patchedData === result.data
          ? result
          : { ...result, data: patchedData };
      }),
    ),
  );
