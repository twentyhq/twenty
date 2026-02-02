import { Suspense, lazy } from 'react';

import { viewableFrontComponentIdComponentState } from '@/command-menu/pages/front-component/states/viewableFrontComponentIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

export const CommandMenuFrontComponentPage = () => {
  const viewableFrontComponentId = useRecoilComponentValue(
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
