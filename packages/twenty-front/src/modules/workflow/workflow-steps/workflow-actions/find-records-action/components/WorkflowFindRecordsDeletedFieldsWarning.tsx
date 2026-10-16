import { unresolvedRecordFiltersComponentState } from '@/object-record/record-filter/states/unresolvedRecordFiltersComponentState';
import { SidePanelInformationBanner } from '@/side-panel/components/SidePanelInformationBanner/SidePanelInformationBanner';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';

export const WorkflowFindRecordsDeletedFieldsWarning = () => {
  const unresolvedRecordFilters = useAtomComponentStateValue(
    unresolvedRecordFiltersComponentState,
  );

  if (unresolvedRecordFilters.length === 0) {
    return null;
  }

  return (
    <SidePanelInformationBanner
      variant="warning"
      message={t`One or more filters reference deactivated or deleted fields and will be automatically removed on save.`}
    />
  );
};
