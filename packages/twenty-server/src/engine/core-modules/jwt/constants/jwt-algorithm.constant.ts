import { type Algorithm } from 'jsonwebtoken';

export const JWT_LEGACY_ALGORITHM = 'HS256' as const satisfies Algorithm;
export const JWT_ASYMMETRIC_ALGORITHM = 'ES256' as const satisfies Algorithm;

export const JWT_SUPPORTED_VERIFY_ALGORITHMS: readonly Algorithm[] = [
  JWT_LEGACY_ALGORITHM,
  JWT_ASYMMETRIC_ALGORITHM,
] as const;
