import { useRecoilValue } from 'recoil';

import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { useEffect } from 'react';
import { CommandMenuPages } from 'twenty-shared/types';

type CommandMenuTopBarInputFocusEffectProps = {
  inputRef: React.RefObject<HTMLInputElement>;
};

export const CommandMenuTopBarInputFocusEffect = ({
  inputRef,
}: CommandMenuTopBarInputFocusEffectProps) => {
  const commandMenuPage = useRecoilValue(commandMenuPageState);

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
