import { useIsHeadlessEngineCommandEffectInitialized } from '@/command-menu-item/engine-command/hooks/useIsHeadlessEngineCommandEffectInitialized';
import { useUnmountCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useEffect } from 'react';

export type HeadlessEngineCommandWrapperEffectProps = {
  execute: () => void | Promise<unknown>;
  ready?: boolean;
};

export const HeadlessEngineCommandWrapperEffect = ({
  execute,
  ready = true,
}: HeadlessEngineCommandWrapperEffectProps) => {
  const { isInitializedRef, setIsInitialized } =
    useIsHeadlessEngineCommandEffectInitialized();

  const commandMenuItemId = useAvailableComponentInstanceIdOrThrow(
    CommandComponentInstanceContext,
  );

  const unmountCommand = useUnmountCommand();

  const { enqueueErrorSnackBar } = useSnackBar();

  useEffect(() => {
    if (isInitializedRef.current || !ready) {
      return;
    }

    setIsInitialized(true);

    const run = async () => {
      await execute();

      unmountCommand(commandMenuItemId);
    };

    run();
  }, [
    execute,
    ready,
    isInitializedRef,
    setIsInitialized,
    commandMenuItemId,
    unmountCommand,
    enqueueErrorSnackBar,
  ]);

  return null;
};
