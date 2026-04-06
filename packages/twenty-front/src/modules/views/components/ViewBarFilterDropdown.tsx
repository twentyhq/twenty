import { useResetFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useResetFilterDropdown';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';

import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewBarFilterDropdownContent } from '@/views/components/ViewBarFilterDropdownContent';
import { useAICElement } from '@aicorg/sdk-react';
import { isDefined } from 'twenty-shared/utils';
import { ViewBarFilterButton } from './ViewBarFilterButton';

export const ViewBarFilterDropdown = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { resetFilterDropdown } = useResetFilterDropdown();
  const { removeRecordFilter } = useRemoveRecordFilter();

  const objectFilterDropdownCurrentRecordFilter = useAtomComponentStateValue(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const handleDropdownClickOutside = () => {
    const recordFilterIsEmpty =
      isDefined(objectFilterDropdownCurrentRecordFilter) &&
      isRecordFilterConsideredEmpty(objectFilterDropdownCurrentRecordFilter);

    if (recordFilterIsEmpty) {
      removeRecordFilter({
        recordFilterId: objectFilterDropdownCurrentRecordFilter.id,
      });
    }
  };

  const handleDropdownClose = () => {
    resetFilterDropdown();
  };

  const handleDropdownOpen = () => {
    resetFilterDropdown();
  };

  const filterAction = useAICElement({
    agentId: `${objectMetadataItem.nameSingular}.view.filter.open`,
    agentAction: 'open',
    agentDescription:
      'Open the current record list filter controls for this object view.',
    agentEntityId: objectMetadataItem.id,
    agentEntityLabel: objectMetadataItem.labelPlural,
    agentEntityType: `${objectMetadataItem.nameSingular}_view`,
    agentLabel: `Open ${objectMetadataItem.labelPlural} filter controls`,
    agentRisk: 'low',
    agentWorkflowStep: `${objectMetadataItem.nameSingular}.view.open_filter`,
  });

  return (
    <Dropdown
      dropdownId={ViewBarFilterDropdownIds.MAIN}
      onClose={handleDropdownClose}
      onOpen={handleDropdownOpen}
      clickableComponent={<ViewBarFilterButton />}
      clickableComponentProps={filterAction.attributes}
      dropdownComponents={<ViewBarFilterDropdownContent />}
      dropdownOffset={{ y: 8 }}
      onClickOutside={handleDropdownClickOutside}
    />
  );
};
