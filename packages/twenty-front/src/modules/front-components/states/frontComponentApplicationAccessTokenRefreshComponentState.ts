import { FrontComponentInstanceContext } from '@/front-components/states/contexts/FrontComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const frontComponentApplicationAccessTokenRefreshComponentState =
  createAtomComponentState<Promise<string> | null>({
    key: 'frontComponentApplicationAccessTokenRefreshComponentState',
    defaultValue: null,
    componentInstanceContext: FrontComponentInstanceContext,
  });
