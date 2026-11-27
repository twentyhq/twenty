import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ kvStore: new Map<string, unknown>() }));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: {
    get: async (key: string) => mocks.kvStore.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      mocks.kvStore.set(key, value);
    },
  },
}));

const { consumeLinkedinProfileLookupOrThrow } =
  await import('src/logic-functions/utils/consume-linkedin-profile-lookup-or-throw.util');

const { UnipileRateLimitError } =
  await import('src/unipile/utils/request-unipile.util');

const LOOKUPS_KEY = 'linkedin-profile-lookups:acc_1';
const HOUR_MILLISECONDS = 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 25, 12);

const consumeLookup = (dailyLimit: number) =>
  consumeLinkedinProfileLookupOrThrow({
    unipileAccountId: 'acc_1',
    dailyLimit,
  });

describe('consumeLinkedinProfileLookupOrThrow', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: NOW });
    mocks.kvStore.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts each lookup of an account', async () => {
    await consumeLookup(3);
    await consumeLookup(3);

    expect(mocks.kvStore.get(LOOKUPS_KEY)).toEqual([NOW, NOW]);
  });

  it('refuses a lookup once the limit of the day is reached, until the oldest one is a day old', async () => {
    mocks.kvStore.set(LOOKUPS_KEY, [
      NOW - 20 * HOUR_MILLISECONDS,
      NOW - 2 * HOUR_MILLISECONDS,
    ]);

    const refusal = await consumeLookup(2).catch((error: unknown) => error);

    expect(refusal).toBeInstanceOf(UnipileRateLimitError);
    expect(refusal).toMatchObject({ retryAfterSeconds: 4 * 60 * 60 });
    expect(mocks.kvStore.get(LOOKUPS_KEY)).toHaveLength(2);
  });

  it('waits for as many lookups to age out as a lower limit needs', async () => {
    mocks.kvStore.set(LOOKUPS_KEY, [
      NOW - 20 * HOUR_MILLISECONDS,
      NOW - 10 * HOUR_MILLISECONDS,
      NOW - 2 * HOUR_MILLISECONDS,
    ]);

    await expect(consumeLookup(2)).rejects.toMatchObject({
      retryAfterSeconds: 14 * 60 * 60,
    });
  });

  it('forgets the lookups older than a day', async () => {
    mocks.kvStore.set(LOOKUPS_KEY, [
      NOW - 25 * HOUR_MILLISECONDS,
      NOW - 2 * HOUR_MILLISECONDS,
    ]);

    await consumeLookup(2);

    expect(mocks.kvStore.get(LOOKUPS_KEY)).toEqual([
      NOW - 2 * HOUR_MILLISECONDS,
      NOW,
    ]);
  });

  it('counts every lookup of a group whose members are looked up together', async () => {
    const lookups = await Promise.allSettled(
      Array.from({ length: 5 }, () => consumeLookup(3)),
    );

    expect(lookups.map(({ status }) => status)).toEqual([
      'fulfilled',
      'fulfilled',
      'fulfilled',
      'rejected',
      'rejected',
    ]);
    expect(mocks.kvStore.get(LOOKUPS_KEY)).toHaveLength(3);
  });

  it('keeps counting after a refused lookup', async () => {
    mocks.kvStore.set(LOOKUPS_KEY, [NOW - 23 * HOUR_MILLISECONDS]);

    await expect(consumeLookup(1)).rejects.toBeInstanceOf(
      UnipileRateLimitError,
    );
    vi.setSystemTime(NOW + 2 * HOUR_MILLISECONDS);

    await expect(consumeLookup(1)).resolves.toBeUndefined();
  });

  it('keeps a separate count per account', async () => {
    mocks.kvStore.set('linkedin-profile-lookups:acc_2', [NOW]);

    await expect(consumeLookup(1)).resolves.toBeUndefined();
  });
});
