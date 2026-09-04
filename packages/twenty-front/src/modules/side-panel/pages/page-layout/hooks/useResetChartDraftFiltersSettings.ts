import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { getChartFiltersSettingsInstanceId } from '@/side-panel/pages/page-layout/utils/getChartFiltersSettingsInstanceId';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { hasInitializedCurrentRecordFilterGroupsComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFilterGroupsComponentFamilyState';
import { hasInitializedCurrentRecordFiltersComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFiltersComponentFamilyState';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useResetChartDraftFiltersSettings = () => {
  const surfaceId = useComponentStateSurfaceId();
  const store = useStore();
  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const resetChartDraftFiltersSettings = useCallback(
    (objectMetadataItemId: string) => {
      if (!isDefined(widgetInEditMode)) {
        return;
      }

      const { instanceId } = getChartFiltersSettingsInstanceId({
        widgetId: widgetInEditMode.id,
        objectMetadataItemId: objectMetadataItemId,
      });

      store.set(
        hasInitializedCurrentRecordFilterGroupsComponentFamilyState.atomFamily({
          familyKey: {},
          instanceId,
          surfaceId,
        }),
        false,
      );

      store.set(
        hasInitializedCurrentRecordFiltersComponentFamilyState.atomFamily({
          familyKey: {},
          instanceId,
          surfaceId,
        }),
        false,
      );

      store.set(
        currentRecordFiltersComponentState.atomFamily({
          instanceId,
          surfaceId,
        }),
        [],
      );
      store.set(
        currentRecordFilterGroupsComponentState.atomFamily({
          instanceId,
          surfaceId,
        }),
        [],
      );
    },
    [widgetInEditMode, store, surfaceId],
  );

  return {
    resetChartDraftFiltersSettings,
  };
};
