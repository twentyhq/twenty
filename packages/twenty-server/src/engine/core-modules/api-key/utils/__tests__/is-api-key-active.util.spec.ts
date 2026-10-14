import { isApiKeyActive } from 'src/engine/core-modules/api-key/utils/is-api-key-active.util';

const NOW = new Date('2026-10-13T12:00:00.000Z');

describe('isApiKeyActive', () => {
  beforeEach(() => jest.useFakeTimers().setSystemTime(NOW));
  afterEach(() => jest.useRealTimers());

  it.each([false, true])(
    'handles entity and cached dates, serialized: %s',
    (serialized) => {
      const date = (milliseconds: number) =>
        serialized
          ? new Date(milliseconds).toISOString()
          : new Date(milliseconds);
      expect(
        isApiKeyActive({ expiresAt: date(NOW.getTime() + 1), revokedAt: null }),
      ).toBe(true);
      expect(
        isApiKeyActive({ expiresAt: date(NOW.getTime()), revokedAt: null }),
      ).toBe(true);
      expect(
        isApiKeyActive({ expiresAt: date(NOW.getTime() - 1), revokedAt: null }),
      ).toBe(false);
      expect(
        isApiKeyActive({
          expiresAt: date(NOW.getTime() + 1),
          revokedAt: date(NOW.getTime() - 1),
        }),
      ).toBe(false);
    },
  );
});
