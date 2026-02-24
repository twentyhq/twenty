import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useEffect } from 'react';
import { CommandMenuPages } from 'twenty-shared/types';

type CommandMenuTopBarInputFocusEffectProps = {
  inputRef: React.RefObject<HTMLInputElement>;
};

export const CommandMenuTopBarInputFocusEffect = ({
  inputRef,
}: CommandMenuTopBarInputFocusEffectProps) => {
  const commandMenuPage = useRecoilValueV2(commandMenuPageState);

  useEffect(() => {
    if (
      commandMenuPage === CommandMenuPages.Root ||
      commandMenuPage === CommandMenuPages.SearchRecords
    ) {
      inputRef.current?.focus();
    }
  }, [commandMenuPage, inputRef]);

  return null;
};
