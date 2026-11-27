import { FrontComponentInstanceContext } from '@/front-components/states/contexts/FrontComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const frontComponentApplicationTokenPairLoadErrorComponentState =
  createAtomComponentState<Error | null>({
    key: 'frontComponentApplicationTokenPairLoadErrorComponentState',
    defaultValue: null,
    componentInstanceContext: FrontComponentInstanceContext,
  });
