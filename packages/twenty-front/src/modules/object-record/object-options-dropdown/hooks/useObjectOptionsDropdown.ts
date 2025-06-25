import { useDropdownContextStateManagement } from '@/dropdown-context-state-management/hooks/useDropdownContextStateManagement';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { useContext } from 'react';

export const useObjectOptionsDropdown = () => {
  const context = useContext(ObjectOptionsDropdownContext);

  if (!context) {
    throw new Error('useObjectOptionsDropdown must be used within a context');
  }

  const { closeDropdown } = useDropdownContextStateManagement({
    context: ObjectOptionsDropdownContext,
  });

  return {
    ...context,
    closeDropdown,
  };
};
