/* oxlint-disable twenty/no-navigate-prefer-link */
import { useCheckIsSoftDeleteFilter } from '@/object-record/record-filter/hooks/useCheckIsSoftDeleteFilter';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { RecordIndexEmptyState } from '@/object-record/record-index/components/RecordIndexEmptyState';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const RecordListEmptyState = () => {
  const { objectMetadataItem, objectNameSingular, viewBarInstanceId } =
    useRecordIndexContextOrThrow();

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const navigate = useNavigateSettings();

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const { isRecordFilterAboutSoftDelete } = useCheckIsSoftDeleteFilter();
  const { removeRecordFilter } = useRemoveRecordFilter();
  const { toggleSoftDeleteFilterState } = useHandleToggleTrashColumnFilter({
    objectNameSingular,
    viewBarId: viewBarInstanceId,
  });

  const handleRemoveSoftDeleteFilter = () => {
    const deletedFilter = currentRecordFilters.find(
      isRecordFilterAboutSoftDelete,
    );

    if (!isDefined(deletedFilter)) {
      return;
    }

    removeRecordFilter({ recordFilterId: deletedFilter.id });
    toggleSoftDeleteFilterState(false);
  };

  return (
    <RecordIndexEmptyState
      objectMetadataItem={objectMetadataItem}
      objectPermissions={objectPermissions}
      isSoftDeleteFilterActive={hasAnySoftDeleteFilterOnView}
      onRemoveSoftDeleteFilter={handleRemoveSoftDeleteFilter}
      onGoToSettings={() => navigate(SettingsPath.Integrations)}
    />
  );
};
