import { RecordPickerNoRecordFoundMenuItem } from '@/object-record/record-picker/components/RecordPickerNoRecordFoundMenuItem';
import { RecordTableWidgetNestedRelationPickerMenuItem } from '@/object-record/record-table-widget/components/RecordTableWidgetNestedRelationPickerMenuItem';
import { type RecordTableWidgetNestedRelationCreateThrough } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
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

type RecordTableWidgetNestedRelationPickerDropdownContentProps = {
  nestedRelationCreateThrough: RecordTableWidgetNestedRelationCreateThrough;
  onRelationRecordSelected: (relationRecordId: string) => void;
};

export const RecordTableWidgetNestedRelationPickerDropdownContent = ({
  nestedRelationCreateThrough,
  onRelationRecordSelected,
}: RecordTableWidgetNestedRelationPickerDropdownContentProps) => {
  const [searchFilter, setSearchFilter] = useState('');

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const { recordsToSelect, loading } = useRecordsForSelect({
    searchFilterText: searchFilter,
    selectedIds: [],
    objectNameSingular:
      nestedRelationCreateThrough.relationObjectMetadataNameSingular,
    allowRequestsToTwentyIcons: true,
    filter: nestedRelationCreateThrough.relationRecordsFilter,
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
          {recordsToSelect.map((relationRecord) => (
            <RecordTableWidgetNestedRelationPickerMenuItem
              key={relationRecord.id}
              relationRecord={relationRecord}
              onSelect={onRelationRecordSelected}
            />
          ))}
          {!loading && recordsToSelect.length === 0 && (
            <RecordPickerNoRecordFoundMenuItem />
          )}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
