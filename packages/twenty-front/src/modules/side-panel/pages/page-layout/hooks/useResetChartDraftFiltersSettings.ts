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

export const useResetChartDraftFiltersSettings = () => {
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
        }),
        false,
      );

      store.set(
        hasInitializedCurrentRecordFiltersComponentFamilyState.atomFamily({
          familyKey: {},
          instanceId,
        }),
        false,
      );

      store.set(
        currentRecordFiltersComponentState.atomFamily({ instanceId }),
        [],
      );
      store.set(
        currentRecordFilterGroupsComponentState.atomFamily({ instanceId }),
        [],
      );
    },
    [widgetInEditMode, store],
  );

  return {
    resetChartDraftFiltersSettings,
  };
};
