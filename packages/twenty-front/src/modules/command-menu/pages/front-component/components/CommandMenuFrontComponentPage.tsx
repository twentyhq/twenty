import { viewableFrontComponentIdComponentState } from '@/command-menu/pages/front-component/states/viewableFrontComponentIdComponentState';
import { FrontComponentRenderer } from '@/front-components/components/FrontComponentRenderer';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const CommandMenuFrontComponentPage = () => {
  const viewableFrontComponentId = useRecoilComponentValue(
    viewableFrontComponentIdComponentState,
  );

  if (!isDefined(viewableFrontComponentId)) {
    return null;
  }

  return <FrontComponentRenderer frontComponentId={viewableFrontComponentId} />;
};
