import { useGlobalActions } from '@/action-menu/actions/global-actions/hooks/useGlobalActions';
import { useEffect } from 'react';

export const GlobalActionMenuEntriesSetterEffect = () => {
  const { registerGlobalActions, unregisterGlobalActions } = useGlobalActions();

  useEffect(() => {
    registerGlobalActions();

    return () => {
      unregisterGlobalActions();
    };
  }, [registerGlobalActions, unregisterGlobalActions]);

  return null;
};
