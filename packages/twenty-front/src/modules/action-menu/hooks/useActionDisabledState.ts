import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { ActionMenuEntry } from '../types/ActionMenuEntry';

export const useActionDisabledState = (action: ActionMenuEntry) => {
  const hasReadOnlyPermission = useHasObjectReadOnlyPermission();

  // Disable destructive or modifying actions when user has read-only permission
  const isDisabledByPermission =
    hasReadOnlyPermission &&
    (action.accent === 'danger' || // Delete/Destroy actions
      action.key.toLowerCase().includes('create') || // Create actions
      action.key.toLowerCase().includes('edit') || // Edit actions
      action.key.toLowerCase().includes('update') || // Update actions
      action.key.toLowerCase().includes('add') || // Add actions
      action.key.toLowerCase().includes('remove')); // Remove actions

  return {
    isDisabled: isDisabledByPermission || action.isDisabled,
  };
};
