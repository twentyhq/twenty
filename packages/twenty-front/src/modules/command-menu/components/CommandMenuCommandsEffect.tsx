import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { commandMenuCommandsState } from '@/command-menu/states/commandMenuCommandsState';
import { computeCommandMenuCommands } from '@/command-menu/utils/computeCommandMenuCommands';
import { mainContextStoreComponentInstanceIdState } from '@/context-store/states/mainContextStoreComponentInstanceId';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

export const CommandMenuCommandsEffect = () => {
  const mainContextStoreComponentInstanceId = useRecoilValue(
    mainContextStoreComponentInstanceIdState,
  );

  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
    mainContextStoreComponentInstanceId,
  );

  const setCommands = useSetRecoilState(commandMenuCommandsState);

  useEffect(() => {
    if (isDefined(mainContextStoreComponentInstanceId)) {
      setCommands(computeCommandMenuCommands(actionMenuEntries));
    }
  }, [mainContextStoreComponentInstanceId, actionMenuEntries, setCommands]);

  return null;
};
