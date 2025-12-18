import { useRecoilValue } from 'recoil';

import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useEffect } from 'react';

type CommandMenuTopBarInputFocusEffectProps = {
  inputRef: React.RefObject<HTMLInputElement>;
};

export const CommandMenuTopBarInputFocusEffect = ({
  inputRef,
}: CommandMenuTopBarInputFocusEffectProps) => {
  const commandMenuPage = useRecoilValue(commandMenuPageState);
  const focusStack = useRecoilValue(focusStackState);
  const isModalInStack = focusStack.some(
    (item) => item.componentInstance.componentType === FocusComponentType.MODAL,
  );

  useEffect(() => {
    if (isModalInStack) {
      inputRef.current?.blur();
      return;
    }

    if (
      commandMenuPage === CommandMenuPages.Root ||
      commandMenuPage === CommandMenuPages.SearchRecords
    ) {
      inputRef.current?.focus();
    }
  }, [commandMenuPage, inputRef, isModalInStack]);

  return null;
};
