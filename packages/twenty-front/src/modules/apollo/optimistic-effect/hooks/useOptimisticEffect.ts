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
import { OptimisticEffect } from '../types/internal/OptimisticEffect';
import { OptimisticEffectDefinition } from '../types/OptimisticEffectDefinition';

export const useOptimisticEffect = ({
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  const apolloClient = useApolloClient();

  const { findManyRecordsQuery, objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const unregisterOptimisticEffect = useRecoilCallback(
    ({ set }) =>
      ({
        variables,
        definition,
      }: {
        variables: ObjectRecordQueryVariables;
        definition: OptimisticEffectDefinition;
      }) => {
        const computedKey = computeOptimisticEffectKey({
          variables,
          definition,
        });

        set(optimisticEffectState, ({ [computedKey]: _, ...rest }) => rest);
      },
    [],
  );

  const registerOptimisticEffect = useRecoilCallback(
    ({ set }) =>
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

        const computedKey = computeOptimisticEffectKey({
          variables,
          definition,
        });

        set(optimisticEffectState, (previousOptimisticEffects) => ({
          ...previousOptimisticEffects,
          [computedKey]: {
            variables,
            ...definition,
          } satisfies OptimisticEffect,
        }));
      },
    [findManyRecordsQuery, objectNameSingular],
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
        if (!objectMetadataItem) return;

        const optimisticEffects = snapshot
          .getLoadable(optimisticEffectState)
          .getValue();

        for (const optimisticEffect of Object.values(optimisticEffects)) {
          if (optimisticEffect.typename !== typename) {
            continue;
          }

          const existingData = apolloClient.readQuery<Record<string, unknown>>({
            query: findManyRecordsQuery,
            variables: optimisticEffect.variables,
          });

          if (
            !existingData &&
            (isNonEmptyArray(updatedRecords) ||
              isNonEmptyArray(deletedRecordIds))
          ) {
            continue;
          }

          // We need to update the typename when createObject type differs from listObject types
          // It is the case for apiKey, where the creation route returns an ApiKeyToken type
          const formattedCreatedRecords =
            createdRecords?.map((data) => ({
              ...data,
              __typename: typename,
            })) || [];

          const formattedUpdatedRecords =
            updatedRecords?.map((data) => ({
              ...data,
              __typename: typename,
            })) || [];

          apolloClient.writeQuery({
            query: findManyRecordsQuery,
            variables: optimisticEffect.variables,
            data: {
              [objectMetadataItem.namePlural]: optimisticEffect.resolver({
                createdRecords: formattedCreatedRecords,
                currentCacheData: existingData?.[objectMetadataItem.namePlural],
                deletedRecordIds,
                updatedRecords: formattedUpdatedRecords,
                variables: optimisticEffect.variables,
              }),
            },
          });
        }
      },
    [apolloClient, findManyRecordsQuery, objectMetadataItem],
  );

  return {
    registerOptimisticEffect,
    triggerOptimisticEffects,
    unregisterOptimisticEffect,
  };
};
