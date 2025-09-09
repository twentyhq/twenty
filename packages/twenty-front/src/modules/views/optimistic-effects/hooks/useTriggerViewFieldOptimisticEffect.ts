import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type CoreViewField } from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useTriggerViewFieldOptimisticEffect = () => {
  const apolloClient = useApolloClient();

  const cache = apolloClient.cache;

  const triggerViewFieldOptimisticEffect = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        createdViewFields = [],
        updatedViewFields = [],
        deletedViewFields = [],
      }: {
        createdViewFields?: CoreViewField[];
        updatedViewFields?: CoreViewField[];
        deletedViewFields?: CoreViewField[];
      }) => {
        const coreViews = getSnapshotValue(snapshot, coreViewsState);
        let newCoreViews = [...coreViews];

        createdViewFields.forEach((createdViewField) => {
          cache.modify<CoreViewWithRelations>({
            id: cache.identify({
              __typename: 'CoreView',
              id: createdViewField.viewId,
            }),
            fields: {
              viewFields: (existingViewFields, { toReference }) => [
                ...(existingViewFields ?? []),
                toReference(createdViewField),
              ],
            },
            optimistic: true,
          });
          const toBeModifiedCoreView = newCoreViews.find(
            (coreView) => coreView.id === createdViewField.viewId,
          );
          if (isDefined(toBeModifiedCoreView)) {
            newCoreViews = [
              ...newCoreViews.filter(
                (coreView) => coreView.id !== createdViewField.viewId,
              ),
              {
                ...toBeModifiedCoreView,
                viewFields: [
                  ...toBeModifiedCoreView.viewFields,
                  createdViewField,
                ],
              },
            ];
          }
        });

        updatedViewFields.forEach((updatedViewField) => {
          cache.modify<CoreViewWithRelations>({
            id: cache.identify({
              __typename: 'CoreView',
              id: updatedViewField.viewId,
            }),
            fields: {
              viewFields: (existingViewFields, { readField, toReference }) =>
                existingViewFields.map((viewField) => {
                  const viewFieldId = readField<string>('id', viewField);
                  if (viewFieldId === updatedViewField.id) {
                    return toReference(updatedViewField);
                  }
                  return viewField;
                }),
            },
            optimistic: true,
          });
          const toBeModifiedCoreView = newCoreViews.find(
            (coreView) => coreView.id === updatedViewField.viewId,
          );
          if (isDefined(toBeModifiedCoreView)) {
            newCoreViews = [
              ...newCoreViews.filter(
                (coreView) => coreView.id !== updatedViewField.viewId,
              ),
              {
                ...toBeModifiedCoreView,
                viewFields: [
                  ...toBeModifiedCoreView.viewFields.filter(
                    (viewField) => viewField.id !== updatedViewField.id,
                  ),
                  updatedViewField,
                ],
              },
            ];
          }
        });

        deletedViewFields.forEach((deletedViewField) => {
          cache.modify<CoreViewWithRelations>({
            id: cache.identify({
              __typename: 'CoreView',
              id: deletedViewField.viewId,
            }),
            fields: {
              viewFields: (existingViewFields, { readField }) =>
                existingViewFields.filter(
                  (viewField) =>
                    readField('id', viewField) !== deletedViewField.id,
                ),
            },
            optimistic: true,
          });
          const toBeModifiedCoreView = newCoreViews.find(
            (coreView) => coreView.id === deletedViewField.viewId,
          );
          if (isDefined(toBeModifiedCoreView)) {
            newCoreViews = [
              ...newCoreViews.filter(
                (coreView) => coreView.id !== deletedViewField.viewId,
              ),
              {
                ...toBeModifiedCoreView,
                viewFields: toBeModifiedCoreView.viewFields.filter(
                  (viewField) => viewField.id !== deletedViewField.id,
                ),
              },
            ];
          }
        });

        if (!isDeeplyEqual(coreViews, newCoreViews)) {
          set(coreViewsState, newCoreViews);
        }
      },
    [cache],
  );

  return {
    triggerViewFieldOptimisticEffect,
  };
};
