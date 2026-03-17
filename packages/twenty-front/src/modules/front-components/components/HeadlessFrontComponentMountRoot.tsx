import { Suspense, lazy } from 'react';

import { CommandMenuItemErrorBoundary } from '@/command-menu-item/display/components/CommandMenuItemErrorBoundary';
import { useUnmountHeadlessFrontComponent } from '@/front-components/hooks/useUnmountHeadlessFrontComponent';
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
  const unmountHeadlessFrontComponent = useUnmountHeadlessFrontComponent();

  return (
    <>
      {[...mountedHeadlessFrontComponentMaps.entries()].map(
        ([frontComponentId, mountContext]) => (
          <CommandMenuItemErrorBoundary
            key={frontComponentId}
            engineCommandId={frontComponentId}
            onError={() => unmountHeadlessFrontComponent(frontComponentId)}
          >
            <Suspense fallback={null}>
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
          </CommandMenuItemErrorBoundary>
        ),
      )}
    </>
  );
};
