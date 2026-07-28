import { type TrustedExternalOriginsByApplicationId } from '@/front-components/types/TrustedExternalOriginsByApplicationId';
import { isTrustedExternalOriginsByApplicationId } from '@/front-components/utils/isTrustedExternalOriginsByApplicationId';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const trustedFrontComponentExternalOriginsState =
  createAtomState<TrustedExternalOriginsByApplicationId>({
    key: 'trustedFrontComponentExternalOriginsState',
    defaultValue: {},
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
    validateInitFn: (payload) =>
      isTrustedExternalOriginsByApplicationId(payload),
  });
