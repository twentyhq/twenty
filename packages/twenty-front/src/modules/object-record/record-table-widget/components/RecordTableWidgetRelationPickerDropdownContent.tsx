import { RecordPickerLoadingSkeletonList } from '@/object-record/record-picker/components/RecordPickerLoadingSkeletonList';
import { RecordPickerNoRecordFoundMenuItem } from '@/object-record/record-picker/components/RecordPickerNoRecordFoundMenuItem';
import { RecordTableWidgetRelationPickerMenuItem } from '@/object-record/record-table-widget/components/RecordTableWidgetRelationPickerMenuItem';
import { useRecordsForSelect } from '@/object-record/select/hooks/useRecordsForSelect';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

type RecordTableWidgetRelationPickerDropdownContentProps = {
  objectNameSingular: string;
  recordsFilter: RecordGqlOperationFilter;
  onRelationRecordSelected: (relationRecordId: string) => void;
};

export const RecordTableWidgetRelationPickerDropdownContent = ({
  objectNameSingular,
  recordsFilter,
  onRelationRecordSelected,
}: RecordTableWidgetRelationPickerDropdownContentProps) => {
  const [searchFilter, setSearchFilter] = useState('');

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const { recordsToSelect, loading } = useRecordsForSelect({
    searchFilterText: searchFilter,
    selectedIds: [],
    objectNameSingular,
    allowRequestsToTwentyIcons: true,
    filter: recordsFilter,
  });

  return (
    <DropdownContent>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={t`Search`}
        value={searchFilter}
        onChange={(event) => setSearchFilter(event.target.value)}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={recordsToSelect.map(
            (relationRecord) => relationRecord.id,
          )}
        >
          {loading && recordsToSelect.length === 0 ? (
            <RecordPickerLoadingSkeletonList />
          ) : (
            <>
              {recordsToSelect.map((relationRecord) => (
                <RecordTableWidgetRelationPickerMenuItem
                  key={relationRecord.id}
                  relationRecord={relationRecord}
                  onSelect={onRelationRecordSelected}
                />
              ))}
              {recordsToSelect.length === 0 && (
                <RecordPickerNoRecordFoundMenuItem />
              )}
            </>
          )}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
