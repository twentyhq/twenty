import {
  ObjectOptionsDropdownContext,
  ObjectOptionsDropdownContextValue,
} from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { RecordBoardColumnHeaderAggregateDropdownContextValue } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContext';
import { useDropdown as useDropdownUi } from '@/ui/layout/dropdown/hooks/useDropdown';
import { Context, useCallback, useContext } from 'react';

export const useDropdown = <
  T extends
    | RecordBoardColumnHeaderAggregateDropdownContextValue
    | ObjectOptionsDropdownContextValue,
>({
  context,
}: {
  context: Context<T>;
}) => {
  const dropdownContext = useContext(context);
  const dropdownId = dropdownContext.dropdownId;
  const { closeDropdown } = useDropdownUi(dropdownId);

  if (!dropdownContext) {
    throw new Error(
      `useDropdown must be used within a context provider (${ObjectOptionsDropdownContext.Provider.name})`,
    );
  }

  const handleCloseDropdown = useCallback(() => {
    dropdownContext.resetContent();
    closeDropdown();
  }, [closeDropdown, dropdownContext]);

  return {
    ...dropdownContext,
    closeDropdown: handleCloseDropdown,
    resetContent: dropdownContext.resetContent,
  };
};
