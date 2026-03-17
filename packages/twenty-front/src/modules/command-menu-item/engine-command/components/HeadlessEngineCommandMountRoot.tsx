import { CommandMenuItemErrorBoundary } from '@/command-menu-item/display/components/CommandMenuItemErrorBoundary';
import { ENGINE_COMPONENT_KEY_HEADLESS_COMPONENT_MAP } from '@/command-menu-item/engine-command/constants/EngineComponentKeyHeadlessComponentMap';
import { useUnmountEngineCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { EngineCommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/EngineCommandComponentInstanceContext';
import { mountedEngineCommandsState } from '@/command-menu-item/engine-command/states/mountedEngineCommandsState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const HeadlessEngineCommandMountRoot = () => {
  const mountedEngineCommands = useAtomStateValue(mountedEngineCommandsState);
  const unmountEngineCommand = useUnmountEngineCommand();

  return (
    <>
      {[...mountedEngineCommands.entries()].map(
        ([engineCommandId, mountContext]) => (
          <CommandMenuItemErrorBoundary
            key={engineCommandId}
            engineCommandId={engineCommandId}
            shouldReportToSentry
            onError={() => unmountEngineCommand(engineCommandId)}
          >
            <ContextStoreComponentInstanceContext.Provider
              value={{ instanceId: mountContext.contextStoreInstanceId }}
            >
              <EngineCommandComponentInstanceContext.Provider
                value={{ instanceId: engineCommandId }}
              >
                {
                  ENGINE_COMPONENT_KEY_HEADLESS_COMPONENT_MAP[
                    mountContext.engineComponentKey
                  ]
                }
              </EngineCommandComponentInstanceContext.Provider>
            </ContextStoreComponentInstanceContext.Provider>
          </CommandMenuItemErrorBoundary>
        ),
      )}
    </>
  );
};
