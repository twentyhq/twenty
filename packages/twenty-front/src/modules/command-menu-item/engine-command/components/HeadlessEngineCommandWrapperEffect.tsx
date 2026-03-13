import { EngineCommandIdContext } from '@/command-menu-item/engine-command/contexts/EngineCommandIdContext';
import { useUnmountEngineCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useContext, useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

export type HeadlessEngineCommandWrapperEffectProps = {
  execute: () => void | Promise<unknown>;
};

export const HeadlessEngineCommandWrapperEffect = ({
  execute,
}: HeadlessEngineCommandWrapperEffectProps) => {
  //eslint-disable-next-line twenty/no-state-useref
  const hasExecutedRef = useRef(false);

  const engineCommandId = useContext(EngineCommandIdContext);

  const unmountEngineCommand = useUnmountEngineCommand();

  const { enqueueErrorSnackBar } = useSnackBar();

  useEffect(() => {
    if (hasExecutedRef.current) {
      return;
    }

    hasExecutedRef.current = true;

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
    hasExecutedRef,
    engineCommandId,
    unmountEngineCommand,
    enqueueErrorSnackBar,
  ]);

  return null;
};
