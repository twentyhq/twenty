import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';

export const useCanEditView = () => {
  const { canPersistChanges: canEditView } = useCanPersistViewChanges();
  return { canEditView };
};
