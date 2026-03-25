import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

type SidePanelTopBarInputFocusEffectProps = {
  inputRef: React.RefObject<HTMLInputElement>;
};

export const SidePanelTopBarInputFocusEffect = ({
  inputRef,
}: SidePanelTopBarInputFocusEffectProps) => {
  const sidePanelPage = useAtomStateValue(sidePanelPageState);

  useEffect(() => {
    if (
      sidePanelPage === SidePanelPages.Root ||
      sidePanelPage === SidePanelPages.SearchRecords
    ) {
      inputRef.current?.focus();
    }
  }, [sidePanelPage, inputRef]);

  return null;
};
