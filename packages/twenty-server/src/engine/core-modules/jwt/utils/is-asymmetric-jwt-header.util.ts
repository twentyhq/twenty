import { isNonEmptyString } from '@sniptt/guards';
import * as jwt from 'jsonwebtoken';
import { isDefined } from 'twenty-shared/utils';

import {
  type JwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { JWT_ASYMMETRIC_ALGORITHM } from 'src/engine/core-modules/jwt/constants/jwt-algorithm.constant';

const ASYMMETRIC_TOKEN_TYPES: ReadonlySet<JwtTokenTypeEnum> = new Set([
  JwtTokenTypeEnum.ACCESS,
  JwtTokenTypeEnum.REFRESH,
]);

export const isAsymmetricSigningEligible = (type: JwtTokenTypeEnum): boolean =>
  ASYMMETRIC_TOKEN_TYPES.has(type);

export const isAsymmetricJwtHeader = (
  header: jwt.JwtHeader | undefined,
  payload: JwtPayload | undefined,
): header is jwt.JwtHeader & {
  kid: string;
  alg: typeof JWT_ASYMMETRIC_ALGORITHM;
} => {
  if (!isDefined(header)) {
    return false;
  }

  if (!isNonEmptyString(header.kid)) {
    return false;
  }

  if (header.alg !== JWT_ASYMMETRIC_ALGORITHM) {
    return false;
  }

  if (!isDefined(payload)) {
    return false;
  }

  return isAsymmetricSigningEligible(payload.type);
};
