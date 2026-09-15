import { createFrontComponentStorageBridge } from '../createFrontComponentStorageBridge';
import { installStorageBridge } from '../installStorageBridge';

const createStorageBridges = () => ({
  localStorage: createFrontComponentStorageBridge({
    storageType: 'localStorage',
  }),
  sessionStorage: createFrontComponentStorageBridge({
    storageType: 'sessionStorage',
  }),
});

describe('installStorageBridge', () => {
  it('should install both storages on the global scope and a distinct window', () => {
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    installStorageBridge({
      globalScope,
      storageBridges: createStorageBridges(),
    });

    expect(globalScope.localStorage).toBe(polyfillWindow.localStorage);
    expect(globalScope.sessionStorage).toBe(polyfillWindow.sessionStorage);
    expect(globalScope.localStorage).not.toBe(globalScope.sessionStorage);
  });

  it('should back each installed storage by its own bridge', () => {
    const globalScope: Record<string, unknown> = {};
    const storageBridges = createStorageBridges();

    storageBridges.localStorage.seed({ theme: '"dark"' });

    installStorageBridge({ globalScope, storageBridges });

    const localStorage = globalScope.localStorage as Storage;
    const sessionStorage = globalScope.sessionStorage as Storage;

    expect(localStorage.getItem('theme')).toBe('"dark"');
    expect(sessionStorage.getItem('theme')).toBeNull();

    sessionStorage.setItem('visits', '2');

    expect(storageBridges.sessionStorage.getItem('visits')).toBe('2');
    expect(storageBridges.localStorage.getItem('visits')).toBeNull();
    expect(localStorage.length).toBe(1);
  });
});
