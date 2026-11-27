import { type Algorithm } from 'jsonwebtoken';

// Asymmetric only: a shared-secret algorithm would let the public key sign assertions.
export const IDENTITY_ASSERTION_ALGORITHMS: Algorithm[] = ['RS256', 'ES256'];
