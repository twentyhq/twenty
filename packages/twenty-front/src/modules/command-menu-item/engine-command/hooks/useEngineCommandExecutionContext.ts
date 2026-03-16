import { engineCommandExecutionContextComponentState } from '@/command-menu-item/engine-command/states/engineCommandExecutionContextComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useEngineCommandExecutionContext = () => {
  const engineCommandExecutionContext = useAtomComponentStateValue(
    engineCommandExecutionContextComponentState,
  );

  if (!isDefined(engineCommandExecutionContext)) {
    throw new Error(
      'Engine command execution context is not populated. Make sure the command was mounted via the engine command mount flow.',
    );
  }

  return engineCommandExecutionContext;
};
