import { useDropdown } from '@/dropdown/hooks/useDropdown';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { useContext } from 'react';

export const useOptionsDropdown = () => {
  const context = useContext(ObjectOptionsDropdownContext);

  if (!context) {
    throw new Error('useOptionsDropdown must be used within a context');
  }

  const { closeDropdown } = useDropdown({
    context: ObjectOptionsDropdownContext,
  });

  return {
    ...context,
    closeDropdown,
  };
};
