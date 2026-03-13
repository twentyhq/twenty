import { EngineCommandIdContext } from '@/command-menu-item/engine-command/contexts/EngineCommandIdContext';
import { useIsHeadlessEngineCommandEffectInitialized } from '@/command-menu-item/engine-command/hooks/useIsHeadlessEngineCommandEffectInitialized';
import { useUnmountEngineCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useContext, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export type HeadlessEngineCommandWrapperEffectProps = {
  execute: () => void | Promise<unknown>;
};

export const HeadlessEngineCommandWrapperEffect = ({
  execute,
}: HeadlessEngineCommandWrapperEffectProps) => {
  const { isInitialized, setIsInitialized } =
    useIsHeadlessEngineCommandEffectInitialized();

  const engineCommandId = useContext(EngineCommandIdContext);

  const unmountEngineCommand = useUnmountEngineCommand();

  const { enqueueErrorSnackBar } = useSnackBar();

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    setIsInitialized(true);

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
    isInitialized,
    setIsInitialized,
    engineCommandId,
    unmountEngineCommand,
    enqueueErrorSnackBar,
  ]);

  return null;
};
