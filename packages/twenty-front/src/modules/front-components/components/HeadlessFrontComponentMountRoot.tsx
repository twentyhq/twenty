import { Suspense, lazy } from 'react';

import { mountedHeadlessFrontComponentIdsState } from '@/front-components/states/mountedHeadlessFrontComponentIdsState';
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
  const mountedHeadlessFrontComponentMap = useAtomStateValue(
    mountedHeadlessFrontComponentIdsState,
  );

  if (mountedHeadlessFrontComponentMap.size === 0) {
    return null;
  }

  return (
    <>
      {[...mountedHeadlessFrontComponentMap.entries()].map(
        ([frontComponentId, mountContext]) => (
          <Suspense key={frontComponentId} fallback={null}>
            <LayoutRenderingProvider
              value={{
                targetRecordIdentifier:
                  isDefined(mountContext.recordId) &&
                  isDefined(mountContext.objectNameSingular)
                    ? {
                        id: mountContext.recordId,
                        targetObjectNameSingular:
                          mountContext.objectNameSingular,
                      }
                    : undefined,
                layoutType: PageLayoutType.DASHBOARD,
                isInRightDrawer: false,
              }}
            >
              <FrontComponentRenderer frontComponentId={frontComponentId} />
            </LayoutRenderingProvider>
          </Suspense>
        ),
      )}
    </>
  );
};
