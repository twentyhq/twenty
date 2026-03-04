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
  const commandMenuPage = useAtomStateValue(sidePanelPageState);

  useEffect(() => {
    if (
      commandMenuPage === SidePanelPages.Root ||
      commandMenuPage === SidePanelPages.SearchRecords
    ) {
      inputRef.current?.focus();
    }
  }, [commandMenuPage, inputRef]);

  return null;
};
