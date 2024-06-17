import { useEffect } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { objectRecordsMultiSelectState } from '@/activities/states/objectRecordsMultiSelectState';
import { selectedObjectRecordsIdsState } from '@/activities/states/selectedObjectRecordsIdsState';
import { MultiRecordSelect } from '@/object-record/relation-picker/components/MultiRecordSelect';
import { useRelationPickerScopedStates } from '@/object-record/relation-picker/hooks/internal/useRelationPickerScopedStates';
import {
  SelectedObjectRecordId,
  useMultiObjectSearch,
} from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';

export const StyledSelectableItem = styled(SelectableItem)`
  height: 100%;
  width: 100%;
`;
export const MultipleObjectRecordSelect = ({
  onSubmit,
  selectedObjectRecordIds,
}: {
  onSubmit?: (objectRecordsIds: string[]) => void;
  selectedObjectRecordIds: SelectedObjectRecordId[];
}) => {
  const { relationPickerSearchFilterState } = useRelationPickerScopedStates();
  const relationPickerSearchFilter = useRecoilValue(
    relationPickerSearchFilterState,
  );
  const { filteredSelectedObjectRecords, loading, objectRecordsToSelect } =
    useMultiObjectSearch({
      searchFilterValue: relationPickerSearchFilter,
      selectedObjectRecordIds,
      excludedObjectRecordIds: [],
      limit: 10,
    });

  const setObjectRecordsMultiSelect = useSetRecoilState(
    objectRecordsMultiSelectState,
  );

  const selectedObjectRecordsIds = useRecoilValue(
    selectedObjectRecordsIdsState,
  );

  const handleSubmit = () => {
    onSubmit?.(selectedObjectRecordsIds);
  };

  useEffect(() => {
    setObjectRecordsMultiSelect([
      ...(filteredSelectedObjectRecords ?? []),
      ...(objectRecordsToSelect ?? []),
    ]);
  }, [
    filteredSelectedObjectRecords,
    objectRecordsToSelect,
    setObjectRecordsMultiSelect,
  ]);

  return (
    <MultiRecordSelect
      onSubmit={handleSubmit}
      loading={loading}
      // searchFilter={searchFilter}
      // setSearchFilter={setSearchFilter}
    />
  );
};
