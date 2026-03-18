import { EngineCommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/EngineCommandComponentInstanceContext';
import { mountedEngineCommandsState } from '@/command-menu-item/engine-command/states/mountedEngineCommandsState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useMountedEngineCommandContext = () => {
  const engineCommandId = useAvailableComponentInstanceIdOrThrow(
    EngineCommandComponentInstanceContext,
  );

  const mountedEngineCommands = useAtomStateValue(mountedEngineCommandsState);
  const context = mountedEngineCommands.get(engineCommandId);

  if (!isDefined(context)) {
    throw new Error(
      'Engine command mount context not found. Make sure the command was mounted via the engine command mount flow.',
    );
  }

  return context;
};
