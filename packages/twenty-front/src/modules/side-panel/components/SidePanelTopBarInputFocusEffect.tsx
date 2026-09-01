import { sidePanelPageInfoSelector } from '@/side-panel/states/sidePanelPageInfoSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

type SidePanelTopBarInputFocusEffectProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
};

export const SidePanelTopBarInputFocusEffect = ({
  inputRef,
}: SidePanelTopBarInputFocusEffectProps) => {
  const sidePanelPage = useAtomStateValue(sidePanelPageInfoSelector).page;

  useEffect(() => {
    if (
      sidePanelPage === SidePanelPages.CommandMenuDisplay ||
      sidePanelPage === SidePanelPages.SearchRecords
    ) {
      inputRef.current?.focus();
    }
  }, [sidePanelPage, inputRef]);

  return null;
};
