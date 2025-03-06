import styled from '@emotion/styled';

import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useCallback } from 'react';

export const StyledSelectableItem = styled(SelectableItem)`
  height: 100%;
  width: 100%;
`;

export const MultipleRecordPickerSearchInput = () => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
  );

  const [recordPickerSearchFilter, setRecordPickerSearchFilter] =
    useRecoilComponentStateV2(multipleRecordPickerSearchFilterComponentState);

  const { performSearch } = useMultipleRecordPickerPerformSearch();

  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRecordPickerSearchFilter(event.currentTarget.value);
      performSearch({
        multipleRecordPickerInstanceId: componentInstanceId,
        forceSearchFilter: event.currentTarget.value,
      });
    },
    [componentInstanceId, performSearch, setRecordPickerSearchFilter],
  );

  return (
    <DropdownMenuSearchInput
      value={recordPickerSearchFilter}
      onChange={handleFilterChange}
      autoFocus
    />
  );
};
