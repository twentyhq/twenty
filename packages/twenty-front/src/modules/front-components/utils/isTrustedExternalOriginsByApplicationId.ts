import { isArray, isObject, isString } from '@sniptt/guards';

import { type TrustedExternalOriginsByApplicationId } from '@/front-components/types/TrustedExternalOriginsByApplicationId';

export const isTrustedExternalOriginsByApplicationId = (
  payload: unknown,
): payload is TrustedExternalOriginsByApplicationId =>
  isObject(payload) &&
  !isArray(payload) &&
  Object.values(payload).every(
    (origins) => isArray(origins) && origins.every(isString),
  );
