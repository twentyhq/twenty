import { FrontComponentInstanceContext } from '@/front-components/states/contexts/FrontComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type ApplicationTokenPair } from '~/generated-metadata/graphql';

export const frontComponentApplicationTokenPairComponentState =
  createComponentState<ApplicationTokenPair | null>({
    key: 'frontComponentApplicationTokenPairComponentState',
    defaultValue: null,
    componentInstanceContext: FrontComponentInstanceContext,
  });
