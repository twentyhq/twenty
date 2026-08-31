import { useCallback, useRef, useState } from 'react';
import { v4 } from 'uuid';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { CREATE_AND_CONNECT_JUNCTION_RECORD } from '@/object-core/graphql/mutations/createAndConnectJunctionRecord';
import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { buildRecordLabelPayload } from '@/object-record/utils/buildRecordLabelPayload';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  type CreateAndConnectJunctionRecordMutation,
  type CreateAndConnectJunctionRecordMutationVariables,
} from '~/generated/graphql';
import { logError } from '~/utils/logError';
import { isDefined } from 'twenty-shared/utils';

type UseCreateAndConnectJunctionRecordArgs = {
  sourceRecordId: string;
  relationFieldMetadataId: string;
  targetObjectMetadataItem: EnrichedObjectMetadataItem;
  junctionObjectMetadataItem: EnrichedObjectMetadataItem;
};

export const useCreateAndConnectJunctionRecord = ({
  sourceRecordId,
  relationFieldMetadataId,
  targetObjectMetadataItem,
  junctionObjectMetadataItem,
}: UseCreateAndConnectJunctionRecordArgs) => {
  const [loading, setLoading] = useState(false);
  // This is an imperative mutex; `loading` remains the render state.
  // oxlint-disable-next-line twenty/no-state-useref
  const isCreatingRef = useRef(false);
  const apolloCoreClient = useApolloCoreClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { refetchAggregateQueries } = useRefetchAggregateQueries();
  const { enqueueErrorSnackBar } = useSnackBar();

  const createTargetRecordInCache = useCreateOneRecordInCache<ObjectRecord>({
    objectMetadataItem: targetObjectMetadataItem,
  });
  const createJunctionRecordInCache = useCreateOneRecordInCache<ObjectRecord>({
    objectMetadataItem: junctionObjectMetadataItem,
  });

  const createAndConnectJunctionRecord = useCallback(
    async (searchInput?: string) => {
      if (isCreatingRef.current) {
        return undefined;
      }

      isCreatingRef.current = true;
      setLoading(true);

      try {
        let mutationResult:
          | CreateAndConnectJunctionRecordMutation['createAndConnectJunctionRecord']
          | undefined;

        try {
          const targetRecordId = v4();
          const targetRecordInput = {
            ...sanitizeRecordInput({
              objectMetadataItem: targetObjectMetadataItem,
              recordInput: buildRecordLabelPayload({
                id: targetRecordId,
                searchInput,
                objectMetadataItem: targetObjectMetadataItem,
              }),
            }),
            id: targetRecordId,
          };

          const { data } = await apolloCoreClient.mutate<
            CreateAndConnectJunctionRecordMutation,
            CreateAndConnectJunctionRecordMutationVariables
          >({
            mutation: CREATE_AND_CONNECT_JUNCTION_RECORD,
            variables: {
              input: {
                sourceRecordId,
                relationFieldMetadataId,
                targetRecordInput,
              },
            },
          });

          mutationResult = data?.createAndConnectJunctionRecord;
        } catch (error) {
          enqueueErrorSnackBar(
            error instanceof Error ? { apolloError: error } : {},
          );
          return undefined;
        }

        if (!isDefined(mutationResult)) {
          enqueueErrorSnackBar({});
          return undefined;
        }

        const createdTargetRecord = {
          ...(mutationResult.targetRecord as ObjectRecord),
          __typename: getObjectTypename(targetObjectMetadataItem.nameSingular),
        };

        const cacheCreatedRecord = ({
          objectMetadataItem,
          record,
          createRecordInCache,
        }: {
          objectMetadataItem: EnrichedObjectMetadataItem;
          record: ObjectRecord;
          createRecordInCache: (record: ObjectRecord) => ObjectRecord;
        }) => {
          try {
            const cachedRecord = createRecordInCache(record);
            const recordNode = getRecordNodeFromRecord({
              objectMetadataItem,
              objectMetadataItems,
              record: cachedRecord,
              computeReferences: false,
            });

            if (!isDefined(recordNode)) {
              return;
            }

            triggerCreateRecordsOptimisticEffect({
              cache: apolloCoreClient.cache,
              objectMetadataItem,
              recordsToCreate: [recordNode],
              objectMetadataItems,
              objectPermissionsByObjectMetadataId,
              upsertRecordsInStore,
            });
          } catch (error) {
            logError(error);
          }
        };

        cacheCreatedRecord({
          objectMetadataItem: targetObjectMetadataItem,
          record: createdTargetRecord,
          createRecordInCache: createTargetRecordInCache,
        });

        const junctionRecordFromServer =
          mutationResult.junctionRecord as ObjectRecord;
        let junctionRecordWithResolvedRelations: Partial<ObjectRecord> = {};

        try {
          junctionRecordWithResolvedRelations =
            computeOptimisticRecordFromInput({
              cache: apolloCoreClient.cache,
              currentWorkspaceMember: null,
              objectMetadataItem: junctionObjectMetadataItem,
              objectMetadataItems,
              recordInput: junctionRecordFromServer,
              objectPermissionsByObjectMetadataId,
            });
        } catch (error) {
          logError(error);
        }

        const createdJunctionRecord = {
          ...junctionRecordWithResolvedRelations,
          ...junctionRecordFromServer,
          __typename: getObjectTypename(
            junctionObjectMetadataItem.nameSingular,
          ),
        };

        cacheCreatedRecord({
          objectMetadataItem: junctionObjectMetadataItem,
          record: createdJunctionRecord,
          createRecordInCache: createJunctionRecordInCache,
        });

        const createdRecords = [
          {
            objectMetadataItem: targetObjectMetadataItem,
            record: createdTargetRecord,
          },
          {
            objectMetadataItem: junctionObjectMetadataItem,
            record: createdJunctionRecord,
          },
        ];

        const aggregateRefetchResults = await Promise.allSettled([
          refetchAggregateQueries({
            objectMetadataNamePlural: targetObjectMetadataItem.namePlural,
          }),
          refetchAggregateQueries({
            objectMetadataNamePlural: junctionObjectMetadataItem.namePlural,
          }),
        ]);

        for (const aggregateRefetchResult of aggregateRefetchResults) {
          if (aggregateRefetchResult.status === 'rejected') {
            logError(aggregateRefetchResult.reason);
          }
        }

        for (const { objectMetadataItem, record } of createdRecords) {
          try {
            dispatchObjectRecordOperationBrowserEvent({
              objectMetadataItem,
              operation: {
                type: 'create-one',
                createdRecord: { ...record, position: null },
              },
            });
          } catch (error) {
            logError(error);
          }
        }

        return createdTargetRecord.id;
      } finally {
        isCreatingRef.current = false;
        setLoading(false);
      }
    },
    [
      apolloCoreClient,
      createJunctionRecordInCache,
      createTargetRecordInCache,
      enqueueErrorSnackBar,
      junctionObjectMetadataItem,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
      refetchAggregateQueries,
      relationFieldMetadataId,
      sourceRecordId,
      targetObjectMetadataItem,
      upsertRecordsInStore,
    ],
  );

  return { createAndConnectJunctionRecord, loading };
};
