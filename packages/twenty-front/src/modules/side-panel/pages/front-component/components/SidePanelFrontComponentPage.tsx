import { LazyFrontComponentRenderer } from '@/front-components/components/LazyFrontComponentRenderer';
import { Suspense } from 'react';

import { FrontComponentSkeletonLoader } from '@/front-components/components/FrontComponentSkeletonLoader';
import { viewableFrontComponentIdComponentState } from '@/side-panel/pages/front-component/states/viewableFrontComponentIdComponentState';
import { viewableFrontComponentRecordContextComponentState } from '@/side-panel/pages/front-component/states/viewableFrontComponentRecordContextComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelFrontComponentPage = () => {
  const sidePanelPageInstanceId = useAvailableComponentInstanceIdOrThrow(
    SidePanelPageComponentInstanceContext,
  );

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
    <Suspense fallback={<FrontComponentSkeletonLoader />}>
      <LazyFrontComponentRenderer
        hostInstanceId={`side-panel-page-${sidePanelPageInstanceId}`}
        frontComponentId={viewableFrontComponentId}
        selectedRecordIds={
          viewableFrontComponentRecordContext?.selectedRecordIds
        }
        selectedRecordsFilter={
          viewableFrontComponentRecordContext?.selectedRecordsFilter
        }
        objectNameSingular={
          viewableFrontComponentRecordContext?.objectNameSingular
        }
        loadingFallback={<FrontComponentSkeletonLoader />}
      />
    </Suspense>
  );
};
