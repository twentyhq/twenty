import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { mountedCommandsState } from '@/command-menu-item/engine-command/states/mountedEngineCommandsState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useMountedCommandState = () => {
  const engineCommandId = useAvailableComponentInstanceIdOrThrow(
    CommandComponentInstanceContext,
  );

  const mountedCommands = useAtomStateValue(mountedCommandsState);
  const mountedCommandState = mountedCommands.get(engineCommandId);

  if (!isDefined(mountedCommandState)) {
    throw new Error(
      'Mounted command state not found. Make sure the command was mounted via the command mount flow.',
    );
  }

  return mountedCommandState;
};
