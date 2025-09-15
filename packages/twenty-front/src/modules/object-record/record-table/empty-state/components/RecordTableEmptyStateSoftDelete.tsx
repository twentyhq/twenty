import { useObjectLabel } from '@/object-metadata/hooks/useObjectLabel';
import { useCheckIsSoftDeleteFilter } from '@/object-record/record-filter/hooks/useCheckIsSoftDeleteFilter';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyStateDisplay } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateDisplay';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconFilterOff } from 'twenty-ui/display';

export const RecordTableEmptyStateSoftDelete = () => {
  const { t } = useLingui();

  const { objectMetadataItem, objectNameSingular, recordTableId } =
    useRecordTableContextOrThrow();

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const { toggleSoftDeleteFilterState } = useHandleToggleTrashColumnFilter({
    objectNameSingular,
    viewBarId: recordTableId,
  });

  const { removeRecordFilter } = useRemoveRecordFilter();

  const { isRecordFilterAboutSoftDelete } = useCheckIsSoftDeleteFilter();

  const handleButtonClick = async () => {
    const deletedFilter = currentRecordFilters.find(
      isRecordFilterAboutSoftDelete,
    );

    if (!isDefined(deletedFilter)) {
      throw new Error('Deleted filter not found');
    }

    removeRecordFilter({ recordFilterId: deletedFilter.id });

    toggleSoftDeleteFilterState(false);
  };

  const objectLabelSingular = useObjectLabel(objectMetadataItem);

  return (
    <RecordTableEmptyStateDisplay
      buttonTitle={t`Remove Deleted filter`}
      subTitle={t`No deleted records matching the filter criteria were found.`}
      title={t`No Deleted ${objectLabelSingular} found`}
      ButtonIcon={IconFilterOff}
      animatedPlaceholderType="noDeletedRecord"
      onClick={handleButtonClick}
    />
  );
};
