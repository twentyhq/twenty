import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { usePersistViewFieldRecords } from '@/views/hooks/internal/usePersistViewFieldRecords';
import { useCreateViewFiltersAndSorts } from '@/views/hooks/useCreateViewFiltersAndSorts';
import { useGetViewFiltersCombined } from '@/views/hooks/useGetCombinedViewFilters';
import { useGetViewSortsCombined } from '@/views/hooks/useGetCombinedViewSorts';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { isPersistingViewFieldsComponentState } from '@/views/states/isPersistingViewFieldsComponentState';
import { GraphQLView } from '@/views/types/GraphQLView';
import { View } from '@/views/types/View';
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

  const { createViewFiltersAndSorts } = useCreateViewFiltersAndSorts();

  const { getViewSortsCombined } = useGetViewSortsCombined(viewBarComponentId);
  const { getViewFiltersCombined } =
    useGetViewFiltersCombined(viewBarComponentId);

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

        if (shouldCopyFiltersAndSorts === true) {
          const sourceViewCombinedFilters = getViewFiltersCombined(view.id);
          const sourceViewCombinedSorts = getViewSortsCombined(view.id);

          await createViewFiltersAndSorts(
            newView.id,
            sourceViewCombinedFilters,
            sourceViewCombinedSorts,
          );
        }

        set(isPersistingViewFieldsCallbackState, false);
      },
    [
      createOneRecord,
      createViewFieldRecords,
      getViewSortsCombined,
      getViewFiltersCombined,
      currentViewIdCallbackState,
      getViewFromCache,
      isPersistingViewFieldsCallbackState,
      createViewFiltersAndSorts,
    ],
  );

  return { createViewFromCurrentView };
};
