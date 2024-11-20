import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useCallback, useContext } from 'react';

export const useOptionsDropdown = () => {
  const { closeDropdown } = useDropdown(OBJECT_OPTIONS_DROPDOWN_ID);

  const context = useContext(ObjectOptionsDropdownContext);

  if (!context) {
    throw new Error(
      'useOptionsDropdown must be used within a ObjectOptionsDropdownContext.Provider',
    );
  }

  const handleCloseDropdown = useCallback(() => {
    context.resetContent();
    closeDropdown();
  }, [closeDropdown, context]);

  return {
    ...context,
    closeDropdown: handleCloseDropdown,
  };
};
