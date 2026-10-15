import { type EntityManager } from 'typeorm';

// A two-factor recovery must not interleave with an OTP verification or a refresh token renewal that already read the
// user's state, so they all take this lock in the transaction that writes their outcome
export const acquireUserAuthenticationLock = async ({
  entityManager,
  userId,
  mode,
}: {
  entityManager: EntityManager;
  userId: string;
  mode: 'shared' | 'exclusive';
}): Promise<void> => {
  await entityManager.query(
    mode === 'shared'
      ? 'SELECT pg_advisory_xact_lock_shared(hashtextextended($1, 0))'
      : 'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
    [`user-authentication:${userId}`],
  );
};
