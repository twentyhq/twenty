import { Suspense, lazy } from 'react';

import { viewableFrontComponentIdComponentState } from '@/side-panel/pages/front-component/states/viewableFrontComponentIdComponentState';
import { viewableFrontComponentRecordContextComponentState } from '@/side-panel/pages/front-component/states/viewableFrontComponentRecordContextComponentState';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

export const SidePanelFrontComponentPage = () => {
  const viewableFrontComponentId = useAtomComponentStateValue(
    viewableFrontComponentIdComponentState,
  );

  const viewableFrontComponentRecordContext = useAtomComponentStateValue(
    viewableFrontComponentRecordContextComponentState,
  );

  if (!isDefined(viewableFrontComponentId)) {
    return null;
  }

  return (
    <LayoutRenderingProvider
      value={{
        targetRecordIdentifier: isDefined(viewableFrontComponentRecordContext)
          ? {
              id: viewableFrontComponentRecordContext.recordId,
              targetObjectNameSingular:
                viewableFrontComponentRecordContext.objectNameSingular,
            }
          : undefined,
        layoutType: PageLayoutType.DASHBOARD,
        isInSidePanel: true,
      }}
    >
      <Suspense fallback={null}>
        <FrontComponentRenderer frontComponentId={viewableFrontComponentId} />
      </Suspense>
    </LayoutRenderingProvider>
  );
};
