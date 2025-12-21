import { useRecoilValue } from 'recoil';

import { COMMAND_MENU_SEARCH_INPUT_FOCUS_ID } from '@/command-menu/constants/CommandMenuSearchInputFocusId';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useEffect } from 'react';

type CommandMenuTopBarInputFocusEffectProps = {
  inputRef: React.RefObject<HTMLInputElement>;
};

export const CommandMenuTopBarInputFocusEffect = ({
  inputRef,
}: CommandMenuTopBarInputFocusEffectProps) => {
  const commandMenuPage = useRecoilValue(commandMenuPageState);
  const currentFocusId = useRecoilValue(currentFocusIdSelector);
  const isTextInputFocused =
    currentFocusId === COMMAND_MENU_SEARCH_INPUT_FOCUS_ID;

  useEffect(() => {
    if (!isTextInputFocused) {
      inputRef.current?.blur();
      return;
    }

    if (
      commandMenuPage === CommandMenuPages.Root ||
      commandMenuPage === CommandMenuPages.SearchRecords
    ) {
      inputRef.current?.focus();
    }
  }, [commandMenuPage, inputRef, isTextInputFocused]);

  return null;
};
