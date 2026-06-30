import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { SidePanelInformationBanner } from 'twenty-ui/feedback';
type ChartFiltersDeletedFieldsWarningProps = {
  validFieldMetadataIds: Set<string>;
};

export const ChartFiltersDeletedFieldsWarning = ({
  validFieldMetadataIds,
}: ChartFiltersDeletedFieldsWarningProps) => {
  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const deletedFieldFiltersCount = currentRecordFilters.filter(
    (recordFilter) => !validFieldMetadataIds.has(recordFilter.fieldMetadataId),
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
