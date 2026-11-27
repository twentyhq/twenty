import { FrontComponentInstanceContext } from '@/front-components/states/contexts/FrontComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const frontComponentInitialApplicationAccessTokenComponentState =
  createAtomComponentState<string | null>({
    key: 'frontComponentInitialApplicationAccessTokenComponentState',
    defaultValue: null,
    componentInstanceContext: FrontComponentInstanceContext,
  });
