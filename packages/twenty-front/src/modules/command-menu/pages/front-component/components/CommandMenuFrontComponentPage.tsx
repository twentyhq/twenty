import { Suspense, lazy } from 'react';

import { viewableFrontComponentIdComponentState } from '@/command-menu/pages/front-component/states/viewableFrontComponentIdComponentState';
import { viewableFrontComponentRecordContextComponentState } from '@/command-menu/pages/front-component/states/viewableFrontComponentRecordContextComponentState';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

export const CommandMenuFrontComponentPage = () => {
  const viewableFrontComponentId = useAtomComponentStateValue(
    viewableFrontComponentIdComponentState,
  );

  const recordContext = useAtomComponentStateValue(
    viewableFrontComponentRecordContextComponentState,
  );

  if (!isDefined(viewableFrontComponentId)) {
    return null;
  }

  return (
    <LayoutRenderingProvider
      value={{
        targetRecordIdentifier: isDefined(recordContext)
          ? {
              id: recordContext.recordId,
              targetObjectNameSingular: recordContext.objectNameSingular,
            }
          : undefined,
        layoutType: PageLayoutType.DASHBOARD,
        isInRightDrawer: true,
      }}
    >
      <Suspense fallback={null}>
        <FrontComponentRenderer frontComponentId={viewableFrontComponentId} />
      </Suspense>
    </LayoutRenderingProvider>
  );
};
