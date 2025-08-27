import { type ObjectOptionsDropdownContextValue } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { type RecordBoardColumnHeaderAggregateDropdownContextValue } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContext';
import { type RecordTableColumnAggregateFooterDropdownContextValue } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type Context, useCallback, useContext } from 'react';

/**
 *
 * @deprecated This hook is deprecated because it uses context instead of recoil and synchronous hooks like we do in the application
 *
 * TODO: refactor this generic way to handle multiple pages in a dropdown with state management and specific code paths in a dedicated module, instead of using context with generic union types.
 */
export const useDropdownContextStateManagement = <
  T extends
    | RecordBoardColumnHeaderAggregateDropdownContextValue
    | RecordTableColumnAggregateFooterDropdownContextValue
    | ObjectOptionsDropdownContextValue,
>({
  context,
}: {
  context: Context<T>;
}) => {
  const dropdownContext = useContext(context);

  if (!dropdownContext) {
    throw new Error(
      `useDropdownContextStateManagement must be used within a context provider (${context.Provider.name})`,
    );
  }
  const dropdownId = dropdownContext.dropdownId;
  const { closeDropdown } = useCloseDropdown();

  const handleCloseDropdown = useCallback(() => {
    dropdownContext.resetContent();
    closeDropdown(dropdownId);
  }, [closeDropdown, dropdownContext, dropdownId]);

  return {
    ...dropdownContext,
    closeDropdown: handleCloseDropdown,
    resetContent: dropdownContext.resetContent,
  };
};
