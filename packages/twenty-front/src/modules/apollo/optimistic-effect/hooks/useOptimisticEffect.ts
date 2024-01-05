import { useApolloClient } from '@apollo/client';
import { isNonEmptyArray } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';

import { computeOptimisticEffectKey } from '@/apollo/optimistic-effect/utils/computeOptimisticEffectKey';
import {
  EMPTY_QUERY,
  useObjectMetadataItem,
} from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';

import { optimisticEffectState } from '../states/optimisticEffectState';
import {
  OptimisticEffect,
  OptimisticEffectWriter,
} from '../types/internal/OptimisticEffect';
import { OptimisticEffectDefinition } from '../types/OptimisticEffectDefinition';

export const useOptimisticEffect = ({
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  const apolloClient = useApolloClient();

  const { findManyRecordsQuery, objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const unregisterOptimisticEffect = useRecoilCallback(
    ({ snapshot, set }) =>
      ({
        variables,
        definition,
      }: {
        variables: ObjectRecordQueryVariables;
        definition: OptimisticEffectDefinition;
      }) => {
        const optimisticEffects = snapshot
          .getLoadable(optimisticEffectState)
          .getValue();

        const computedKey = computeOptimisticEffectKey({
          variables,
          definition,
        });

        const { [computedKey]: _, ...rest } = optimisticEffects;

        set(optimisticEffectState, rest);
      },
  );

  const registerOptimisticEffect = useRecoilCallback(
    ({ snapshot, set }) =>
      ({
        variables,
        definition,
      }: {
        variables: ObjectRecordQueryVariables;
        definition: OptimisticEffectDefinition;
      }) => {
        if (findManyRecordsQuery === EMPTY_QUERY) {
          throw new Error(
            `Trying to register an optimistic effect for unknown object ${objectNameSingular}`,
          );
        }

        const optimisticEffects = snapshot
          .getLoadable(optimisticEffectState)
          .getValue();

        const optimisticEffectWriter: OptimisticEffectWriter = ({
          cache,
          createdRecords,
          updatedRecords,
          deletedRecordIds,
          query,
          variables,
          objectMetadataItem,
        }) => {
          if (objectMetadataItem) {
            const existingData = cache.readQuery({
              query: findManyRecordsQuery,
              variables,
            });

            if (
              !existingData &&
              (isNonEmptyArray(updatedRecords) ||
                isNonEmptyArray(deletedRecordIds))
            ) {
              return;
            }

            cache.writeQuery({
              query: findManyRecordsQuery,
              variables,
              data: {
                [objectMetadataItem.namePlural]: definition.resolver({
                  currentCacheData: (existingData as any)?.[
                    objectMetadataItem.namePlural
                  ],
                  updatedRecords,
                  createdRecords,
                  deletedRecordIds,
                  variables,
                }),
              },
            });

            return;
          }

          const existingData = cache.readQuery({
            query: query ?? findManyRecordsQuery,
            variables,
          });

          if (!existingData) {
            return;
          }
        };

        const computedKey = computeOptimisticEffectKey({
          variables,
          definition,
        });

        const optimisticEffect = {
          variables,
          typename: definition.typename,
          query: definition.query,
          writer: optimisticEffectWriter,
          objectMetadataItem,
        } satisfies OptimisticEffect;

        set(optimisticEffectState, {
          ...optimisticEffects,
          [computedKey]: optimisticEffect,
        });
      },
    [findManyRecordsQuery, objectNameSingular, objectMetadataItem],
  );

  const triggerOptimisticEffects = useRecoilCallback(
    ({ snapshot }) =>
      ({
        typename,
        createdRecords,
        updatedRecords,
        deletedRecordIds,
      }: {
        typename: string;
        createdRecords?: Record<string, unknown>[];
        updatedRecords?: Record<string, unknown>[];
        deletedRecordIds?: string[];
      }) => {
        const optimisticEffects = snapshot
          .getLoadable(optimisticEffectState)
          .getValue();

        for (const optimisticEffect of Object.values(optimisticEffects)) {
          // We need to update the typename when createObject type differs from listObject types
          // It is the case for apiKey, where the creation route returns an ApiKeyToken type
          const formattedCreatedRecords = isNonEmptyArray(createdRecords)
            ? createdRecords.map((data: any) => {
                return { ...data, __typename: typename };
              })
            : [];

          const formattedUpdatedRecords = isNonEmptyArray(updatedRecords)
            ? updatedRecords.map((data: any) => {
                return { ...data, __typename: typename };
              })
            : [];

          if (optimisticEffect.typename === typename) {
            optimisticEffect.writer({
              cache: apolloClient.cache,
              query: optimisticEffect.query,
              createdRecords: formattedCreatedRecords,
              updatedRecords: formattedUpdatedRecords,
              deletedRecordIds,
              variables: optimisticEffect.variables,
              objectMetadataItem: optimisticEffect.objectMetadataItem,
            });
          }
        }
      },
    [apolloClient.cache],
  );

  return {
    registerOptimisticEffect,
    triggerOptimisticEffects,
    unregisterOptimisticEffect,
  };
};
