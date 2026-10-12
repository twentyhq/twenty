import { type ObjectOptionsDropdownContextValue } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type Context, useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useDropdownContextStateManagement = <
  TDropdownContext extends ObjectOptionsDropdownContextValue,
>({
  context,
}: {
  context: Context<TDropdownContext>;
}) => {
  const dropdownContext = useContext(context);

  if (!isDefined(dropdownContext)) {
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
