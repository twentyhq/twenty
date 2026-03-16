import { useIsHeadlessEngineCommandEffectInitialized } from '@/command-menu-item/engine-command/hooks/useIsHeadlessEngineCommandEffectInitialized';
import { useUnmountEngineCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { EngineCommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/EngineCommandComponentInstanceContext';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useEffect } from 'react';

export type HeadlessEngineCommandWrapperEffectProps = {
  execute: () => void | Promise<unknown>;
};

export const HeadlessEngineCommandWrapperEffect = ({
  execute,
}: HeadlessEngineCommandWrapperEffectProps) => {
  const { getIsInitialized, setIsInitialized } =
    useIsHeadlessEngineCommandEffectInitialized();

  const engineCommandId = useAvailableComponentInstanceIdOrThrow(
    EngineCommandComponentInstanceContext,
  );

  const unmountEngineCommand = useUnmountEngineCommand();

  const { enqueueErrorSnackBar } = useSnackBar();

  useEffect(() => {
    if (getIsInitialized()) {
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
        unmountEngineCommand(engineCommandId);
      }
    };

    run();
  }, [
    execute,
    getIsInitialized,
    setIsInitialized,
    engineCommandId,
    unmountEngineCommand,
    enqueueErrorSnackBar,
  ]);

  return null;
};
