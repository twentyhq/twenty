import styled from '@emotion/styled';

import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useCallback } from 'react';

export const StyledSelectableItem = styled(SelectableItem)`
  height: 100%;
  width: 100%;
`;

export const MultipleRecordPickerSearchInput = () => {
  const [recordPickerSearchFilter, setRecordPickerSearchFilter] =
    useRecoilComponentStateV2(multipleRecordPickerSearchFilterComponentState);

  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRecordPickerSearchFilter(event.currentTarget.value);
    },
    [setRecordPickerSearchFilter],
  );

  return (
    <DropdownMenuSearchInput
      value={recordPickerSearchFilter}
      onChange={handleFilterChange}
      autoFocus
    />
  );
};
