import { EngineCommandIdContext } from '@/command-menu-item/engine-command/contexts/EngineCommandIdContext';
import { useUnmountEngineCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useContext, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export type HeadlessEngineCommandWrapperEffectProps = {
  execute: () => void | Promise<unknown>;
};

export const HeadlessEngineCommandWrapperEffect = ({
  execute,
}: HeadlessEngineCommandWrapperEffectProps) => {
  const [hasExecuted, setHasExecuted] = useState(false);

  const engineCommandId = useContext(EngineCommandIdContext);

  const unmountEngineCommand = useUnmountEngineCommand();

  const { enqueueErrorSnackBar } = useSnackBar();

  useEffect(() => {
    if (hasExecuted) {
      return;
    }

    setHasExecuted(true);

    const run = async () => {
      try {
        await execute();
      } catch (error) {
        if (error instanceof Error) {
          enqueueErrorSnackBar({
            message: error.message,
          });
        }
      } finally {
        if (!isDefined(engineCommandId)) {
          return;
        }

        unmountEngineCommand(engineCommandId);
      }
    };

    run();
  }, [
    execute,
    hasExecuted,
    engineCommandId,
    unmountEngineCommand,
    enqueueErrorSnackBar,
  ]);

  return null;
};
