import { Suspense, lazy } from 'react';

import { ENGINE_COMPONENT_KEY_HEADLESS_COMPONENT_MAP } from '@/command-menu-item/engine-command/constants/EngineComponentKeyHeadlessComponentMap';
import { EngineCommandIdContext } from '@/command-menu-item/engine-command/contexts/EngineCommandIdContext';
import { mountedEngineCommandsState } from '@/command-menu-item/engine-command/states/mountedEngineCommandsState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { mountedHeadlessFrontComponentMapsState } from '@/front-components/states/mountedHeadlessFrontComponentMapsState';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

export const HeadlessFrontComponentMountRoot = () => {
  const mountedHeadlessFrontComponentMaps = useAtomStateValue(
    mountedHeadlessFrontComponentMapsState,
  );

  const mountedEngineCommands = useAtomStateValue(mountedEngineCommandsState);

  const hasFrontComponents = mountedHeadlessFrontComponentMaps.size > 0;
  const hasEngineCommands = mountedEngineCommands.size > 0;

  return (
    <>
      {hasFrontComponents &&
        [...mountedHeadlessFrontComponentMaps.entries()].map(
          ([frontComponentId, mountContext]) => (
            <Suspense key={frontComponentId} fallback={null}>
              <LayoutRenderingProvider
                value={{
                  targetRecordIdentifier:
                    isDefined(mountContext) &&
                    isDefined(mountContext.objectNameSingular)
                      ? {
                          id: mountContext.recordId,
                          targetObjectNameSingular:
                            mountContext.objectNameSingular,
                        }
                      : undefined,
                  layoutType: PageLayoutType.DASHBOARD,
                  isInSidePanel: false,
                }}
              >
                <FrontComponentRenderer frontComponentId={frontComponentId} />
              </LayoutRenderingProvider>
            </Suspense>
          ),
        )}
      {hasEngineCommands &&
        [...mountedEngineCommands.entries()].map(
          ([engineCommandId, mountContext]) => (
            <ContextStoreComponentInstanceContext.Provider
              key={engineCommandId}
              value={{ instanceId: mountContext.contextStoreInstanceId }}
            >
              <EngineCommandIdContext.Provider value={engineCommandId}>
                {
                  ENGINE_COMPONENT_KEY_HEADLESS_COMPONENT_MAP[
                    mountContext.engineComponentKey
                  ]
                }
              </EngineCommandIdContext.Provider>
            </ContextStoreComponentInstanceContext.Provider>
          ),
        )}
    </>
  );
};
