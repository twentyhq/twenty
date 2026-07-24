import { type TrustedExternalOriginsByApplicationId } from '@/front-components/types/TrustedExternalOriginsByApplicationId';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const trustedFrontComponentExternalOriginsState =
  createAtomState<TrustedExternalOriginsByApplicationId>({
    key: 'trustedFrontComponentExternalOriginsState',
    defaultValue: {},
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
  });
