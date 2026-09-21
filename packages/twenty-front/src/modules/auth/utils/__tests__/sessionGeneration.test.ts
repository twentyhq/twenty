import { clearSessionGeneration } from '@/auth/utils/clearSessionGeneration';
import { getSessionGeneration } from '@/auth/utils/getSessionGeneration';
import { rotateSessionGeneration } from '@/auth/utils/rotateSessionGeneration';

describe('sessionGeneration', () => {
  beforeEach(() => {
    clearSessionGeneration();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    clearSessionGeneration();
  });

  it('should rotate and clear the session generation', () => {
    rotateSessionGeneration();
    const firstGeneration = getSessionGeneration();

    rotateSessionGeneration();

    expect(firstGeneration).not.toBeNull();
    expect(getSessionGeneration()).not.toBe(firstGeneration);

    clearSessionGeneration();

    expect(getSessionGeneration()).toBeNull();
  });

  it('should keep an in-memory generation when storage is unavailable', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage is unavailable');
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage is unavailable');
    });

    rotateSessionGeneration();
    const firstGeneration = getSessionGeneration();

    rotateSessionGeneration();

    expect(firstGeneration).not.toBeNull();
    expect(getSessionGeneration()).not.toBe(firstGeneration);
  });

  it('should not replace an unpersisted generation with a stale stored one', () => {
    rotateSessionGeneration();
    const persistedGeneration = getSessionGeneration();

    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage is read-only');
    });

    rotateSessionGeneration();

    expect(getSessionGeneration()).not.toBeNull();
    expect(getSessionGeneration()).not.toBe(persistedGeneration);
  });
});
