import { type KeyObject } from 'crypto';

export type IdentityAssertionSigningKeySet = {
  keysByKeyId: Map<string, KeyObject>;
  fetchedAt: number | undefined;
  fetchAttemptedAt: number | undefined;
  fetch: Promise<void> | undefined;
};
