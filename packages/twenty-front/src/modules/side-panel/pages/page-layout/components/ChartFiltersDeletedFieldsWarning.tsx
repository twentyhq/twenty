import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { unresolvedRecordFiltersComponentState } from '@/object-record/record-filter/states/unresolvedRecordFiltersComponentState';
import { SidePanelInformationBanner } from '@/side-panel/components/SidePanelInformationBanner/SidePanelInformationBanner';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
type ChartFiltersDeletedFieldsWarningProps = {
  validFieldMetadataIds: Set<string>;
};

export const ChartFiltersDeletedFieldsWarning = ({
  validFieldMetadataIds,
}: ChartFiltersDeletedFieldsWarningProps) => {
  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const unresolvedRecordFilters = useAtomComponentStateValue(
    unresolvedRecordFiltersComponentState,
  );

  const deletedFieldFiltersCount =
    unresolvedRecordFilters.length +
    currentRecordFilters.filter(
      (recordFilter) =>
        !validFieldMetadataIds.has(recordFilter.fieldMetadataId),
    ).length;

  if (deletedFieldFiltersCount === 0) {
    return null;
  }

  return (
    <SidePanelInformationBanner
      variant="warning"
      message={t`One or more filters reference deactivated or deleted fields and will be automatically removed on save.`}
    />
  );
};
