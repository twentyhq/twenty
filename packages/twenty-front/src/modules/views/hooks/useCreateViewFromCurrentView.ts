import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { RecordIndexRootPropsContext } from '@/object-record/record-index/contexts/RecordIndexRootPropsContext';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { usePersistViewFieldRecords } from '@/views/hooks/internal/usePersistViewFieldRecords';
import { usePersistViewFilterRecords } from '@/views/hooks/internal/usePersistViewFilterRecords';
import { usePersistViewGroupRecords } from '@/views/hooks/internal/usePersistViewGroupRecords';
import { usePersistViewSortRecords } from '@/views/hooks/internal/usePersistViewSortRecords';
import { useGetViewFiltersCombined } from '@/views/hooks/useGetCombinedViewFilters';
import { useGetViewSortsCombined } from '@/views/hooks/useGetCombinedViewSorts';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { isPersistingViewFieldsComponentState } from '@/views/states/isPersistingViewFieldsComponentState';
import { GraphQLView } from '@/views/types/GraphQLView';
import { View } from '@/views/types/View';
import { ViewGroup } from '@/views/types/ViewGroup';
import { ViewType } from '@/views/types/ViewType';
import { isNonEmptyArray } from '@sniptt/guards';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-ui';
import { v4 } from 'uuid';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useCreateViewFromCurrentView = (viewBarComponentId?: string) => {
  const currentViewIdCallbackState = useRecoilComponentCallbackStateV2(
    currentViewIdComponentState,
    viewBarComponentId,
  );

  const isPersistingViewFieldsCallbackState = useRecoilComponentCallbackStateV2(
    isPersistingViewFieldsComponentState,
    viewBarComponentId,
  );

  const { getViewFromCache } = useGetViewFromCache();

  const { createOneRecord } = useCreateOneRecord<View>({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const { createViewFieldRecords } = usePersistViewFieldRecords();

  const { getViewSortsCombined } = useGetViewSortsCombined(viewBarComponentId);
  const { getViewFiltersCombined } =
    useGetViewFiltersCombined(viewBarComponentId);

  const { createViewSortRecords } = usePersistViewSortRecords();

  const { createViewGroupRecords } = usePersistViewGroupRecords();

  const { createViewFilterRecords } = usePersistViewFilterRecords();

  const { objectMetadataItem } = useContext(RecordIndexRootPropsContext);

  const createViewFromCurrentView = useRecoilCallback(
    ({ snapshot, set }) =>
      async (
        {
          id,
          name,
          icon,
          kanbanFieldMetadataId,
          type,
        }: Partial<
          Pick<
            GraphQLView,
            'id' | 'name' | 'icon' | 'kanbanFieldMetadataId' | 'type'
          >
        >,
        shouldCopyFiltersAndSorts?: boolean,
      ) => {
        const currentViewId = getSnapshotValue(
          snapshot,
          currentViewIdCallbackState,
        );

        if (!isDefined(currentViewId)) {
          return;
        }

        // Here we might instead want to get view from unsaved filters ?
        const view = await getViewFromCache(currentViewId);

        if (!isDefined(view)) {
          return;
        }

        set(isPersistingViewFieldsCallbackState, true);

        const newView = await createOneRecord({
          id: id ?? v4(),
          name: name ?? view.name,
          icon: icon ?? view.icon,
          key: null,
          kanbanFieldMetadataId:
            kanbanFieldMetadataId ?? view.kanbanFieldMetadataId,
          type: type ?? view.type,
          objectMetadataId: view.objectMetadataId,
        });

        if (isUndefinedOrNull(newView)) {
          throw new Error('Failed to create view');
        }

        await createViewFieldRecords(view.viewFields, newView);

        if (type === ViewType.Kanban) {
          if (!isNonEmptyArray(view.viewGroups)) {
            if (!isDefined(kanbanFieldMetadataId)) {
              throw new Error('Kanban view must have a kanban field');
            }

            const viewGroupsToCreate =
              objectMetadataItem?.fields
                ?.find((field) => field.id === kanbanFieldMetadataId)
                ?.options?.map(
                  (option, index) =>
                    ({
                      id: v4(),
                      __typename: 'ViewGroup',
                      fieldMetadataId: kanbanFieldMetadataId,
                      fieldValue: option.value,
                      isVisible: true,
                      position: index,
                    }) satisfies ViewGroup,
                ) ?? [];

            viewGroupsToCreate.push({
              __typename: 'ViewGroup',
              id: v4(),
              fieldValue: '',
              position: viewGroupsToCreate.length,
              isVisible: true,
              fieldMetadataId: kanbanFieldMetadataId,
            } satisfies ViewGroup);

            await createViewGroupRecords(viewGroupsToCreate, newView);
          } else {
            await createViewGroupRecords(view.viewGroups, newView);
          }
        }

        if (shouldCopyFiltersAndSorts === true) {
          const sourceViewCombinedFilters = getViewFiltersCombined(view.id);
          const sourceViewCombinedSorts = getViewSortsCombined(view.id);

          await createViewSortRecords(sourceViewCombinedSorts, view);
          await createViewFilterRecords(sourceViewCombinedFilters, view);
        }

        set(isPersistingViewFieldsCallbackState, false);
      },
    [
      objectMetadataItem,
      createViewSortRecords,
      createViewFilterRecords,
      createOneRecord,
      createViewFieldRecords,
      getViewSortsCombined,
      getViewFiltersCombined,
      currentViewIdCallbackState,
      getViewFromCache,
      isPersistingViewFieldsCallbackState,
      createViewGroupRecords,
    ],
  );

  return { createViewFromCurrentView };
};
