import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { getChartFiltersSettingsInstanceId } from '@/command-menu/pages/page-layout/utils/getChartFiltersSettingsInstanceId';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { hasInitializedCurrentRecordFilterGroupsComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFilterGroupsComponentFamilyState';
import { hasInitializedCurrentRecordFiltersComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFiltersComponentFamilyState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useResetChartDraftFiltersSettings = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const resetChartDraftFiltersSettings = useRecoilCallback(
    ({ set }) =>
      (objectMetadataItemId: string) => {
        if (!isDefined(widgetInEditMode)) {
          return;
        }

        const { instanceId } = getChartFiltersSettingsInstanceId({
          widgetId: widgetInEditMode.id,
          objectMetadataItemId: objectMetadataItemId,
        });

        set(
          hasInitializedCurrentRecordFilterGroupsComponentFamilyState.atomFamily(
            {
              familyKey: {},
              instanceId,
            },
          ),
          false,
        );

        set(
          hasInitializedCurrentRecordFiltersComponentFamilyState.atomFamily({
            familyKey: {},
            instanceId,
          }),
          false,
        );

        set(currentRecordFiltersComponentState.atomFamily({ instanceId }), []);
        set(
          currentRecordFilterGroupsComponentState.atomFamily({ instanceId }),
          [],
        );
      },
    [widgetInEditMode],
  );

  return {
    resetChartDraftFiltersSettings,
  };
};
