import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { commandMenuCommandsState } from '@/command-menu/states/commandMenuCommandsState';
import { computeCommandMenuCommands } from '@/command-menu/utils/computeCommandMenuCommands';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

export const CommandMenuCommandsEffect = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );

  const setCommands = useSetRecoilState(commandMenuCommandsState);

  useEffect(() => {
    setCommands(computeCommandMenuCommands(actionMenuEntries));
  }, [actionMenuEntries, setCommands]);

  return null;
};
