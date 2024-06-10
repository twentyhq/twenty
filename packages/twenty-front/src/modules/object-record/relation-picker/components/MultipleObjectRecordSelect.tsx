import { useMemo, useState } from 'react';
import styled from '@emotion/styled';

import { MultiRecordSelect } from '@/object-record/relation-picker/components/MultiRecordSelect';
import {
  ObjectRecordForSelect,
  SelectedObjectRecordId,
  useMultiObjectSearch,
} from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';

export const StyledSelectableItem = styled(SelectableItem)`
  height: 100%;
  width: 100%;
`;
export const MultipleObjectRecordSelect = ({
  onChange,
  onSubmit,
  selectedObjectRecordIds,
}: {
  onChange?: (
    changedRecordForSelect: ObjectRecordForSelect,
    newSelectedValue: boolean,
  ) => void;
  onSubmit?: (objectRecordsForSelect: ObjectRecordForSelect[]) => void;
  selectedObjectRecordIds: SelectedObjectRecordId[];
}) => {
  const [searchFilter, setSearchFilter] = useState<string>('');

  const {
    filteredSelectedObjectRecords,
    loading,
    objectRecordsToSelect,
    selectedObjectRecords,
  } = useMultiObjectSearch({
    searchFilterValue: searchFilter,
    selectedObjectRecordIds,
    excludedObjectRecordIds: [],
    limit: 10,
  });

  const selectedObjectRecordsForSelect = useMemo(
    () =>
      selectedObjectRecords.filter((selectedObjectRecord) =>
        selectedObjectRecordIds.some(
          (selectedObjectRecordId) =>
            selectedObjectRecordId.id ===
            selectedObjectRecord.recordIdentifier.id,
        ),
      ),
    [selectedObjectRecords, selectedObjectRecordIds],
  );

  return (
    <MultiRecordSelect
      onChange={onChange}
      onSubmit={onSubmit}
      selectedObjectRecords={selectedObjectRecordsForSelect}
      allRecords={[
        ...(filteredSelectedObjectRecords ?? []),
        ...(objectRecordsToSelect ?? []),
      ]}
      loading={loading}
      searchFilter={searchFilter}
      setSearchFilter={setSearchFilter}
    />
  );
};
