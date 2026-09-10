import { useIsHeadlessEngineCommandEffectInitialized } from '@/command-menu-item/engine-command/hooks/useIsHeadlessEngineCommandEffectInitialized';
import { useUnmountCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useEffect } from 'react';
import { useToast } from 'twenty-ui/feedback';

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

  const { enqueueToast } = useToast();

  useEffect(() => {
    if (isInitializedRef.current || !ready) {
      return;
    }

    setIsInitialized(true);

    const run = async () => {
      try {
        await execute();
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));
      } finally {
        // Unmount even on failure, otherwise the headless command stays mounted
        // and can never be triggered again.
        unmountCommand(commandMenuItemId);
      }
    };

    run();
  }, [
    execute,
    ready,
    isInitializedRef,
    setIsInitialized,
    commandMenuItemId,
    unmountCommand,
    enqueueToast,
  ]);

  return null;
};
