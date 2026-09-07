import {
  clearSessionGeneration,
  getSessionGeneration,
  rotateSessionGeneration,
} from '@/auth/utils/sessionGeneration';

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
});
