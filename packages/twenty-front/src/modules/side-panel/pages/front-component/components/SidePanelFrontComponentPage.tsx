import { Suspense, lazy } from 'react';

import { viewableFrontComponentIdComponentState } from '@/side-panel/pages/front-component/states/viewableFrontComponentIdComponentState';
import { viewableFrontComponentRecordContextComponentState } from '@/side-panel/pages/front-component/states/viewableFrontComponentRecordContextComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

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

  const selectedRecordIds = isDefined(
    viewableFrontComponentRecordContext?.recordId,
  )
    ? [viewableFrontComponentRecordContext.recordId]
    : undefined;

  return (
    <Suspense fallback={null}>
      <FrontComponentRenderer
        frontComponentId={viewableFrontComponentId}
        selectedRecordIds={selectedRecordIds}
      />
    </Suspense>
  );
};
