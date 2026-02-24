import { Suspense, lazy } from 'react';

import { viewableFrontComponentIdComponentState } from '@/command-menu/pages/front-component/states/viewableFrontComponentIdComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { isDefined } from 'twenty-shared/utils';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

export const CommandMenuFrontComponentPage = () => {
  const viewableFrontComponentId = useAtomComponentValue(
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
