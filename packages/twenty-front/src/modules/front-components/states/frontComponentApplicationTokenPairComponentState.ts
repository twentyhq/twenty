import { FrontComponentInstanceContext } from '@/front-components/states/contexts/FrontComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type ApplicationTokenPair } from '~/generated-metadata/graphql';

export const frontComponentApplicationTokenPairComponentState =
  createAtomComponentState<ApplicationTokenPair | null>({
    key: 'frontComponentApplicationTokenPairComponentState',
    defaultValue: null,
    componentInstanceContext: FrontComponentInstanceContext,
  });
