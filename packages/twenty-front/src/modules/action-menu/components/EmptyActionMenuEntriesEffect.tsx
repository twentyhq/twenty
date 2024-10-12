import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useEffect } from 'react';

export const EmptyActionMenuEntriesEffect = () => {
  const setActionMenuEntries = useSetRecoilComponentStateV2(
    actionMenuEntriesComponentState,
  );
  useEffect(() => {
    setActionMenuEntries([]);
  }, [setActionMenuEntries]);

  return null;
};
