import { Suspense, lazy } from 'react';

import { viewableFrontComponentIdComponentState } from '@/command-menu/pages/front-component/states/viewableFrontComponentIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

export const CommandMenuFrontComponentPage = () => {
  const viewableFrontComponentId = useRecoilComponentValueV2(
    viewableFrontComponentIdComponentState,
  );

  if (!isDefined(viewableFrontComponentId)) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <FrontComponentRenderer frontComponentId={viewableFrontComponentId} />
    </Suspense>
  );
};
