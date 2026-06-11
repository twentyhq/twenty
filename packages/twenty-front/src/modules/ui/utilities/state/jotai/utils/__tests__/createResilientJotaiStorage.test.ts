import { createResilientJotaiStorage } from '@/ui/utilities/state/jotai/utils/createResilientJotaiStorage';

const buildFakeStorage = (overrides: Partial<Storage> = {}): Storage => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    ...overrides,
  };
};

describe('createResilientJotaiStorage', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should round-trip values through the underlying storage', () => {
    const fakeStorage = buildFakeStorage();
    const storage = createResilientJotaiStorage<{ count: number }>(
      () => fakeStorage,
    );

    storage.setItem('my-key', { count: 2 });

    expect(storage.getItem('my-key', { count: 0 })).toEqual({ count: 2 });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should not throw and should evict the key when a write fails', () => {
    const removeItem = jest.fn();
    const fakeStorage = buildFakeStorage({
      setItem: () => {
        throw new DOMException('The quota has been exceeded.');
      },
      removeItem,
    });
    const storage = createResilientJotaiStorage<string>(() => fakeStorage);

    expect(() => storage.setItem('my-key', 'value')).not.toThrow();
    expect(removeItem).toHaveBeenCalledWith('my-key');
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should not throw when eviction after a failed write also fails', () => {
    const fakeStorage = buildFakeStorage({
      setItem: () => {
        throw new DOMException('The quota has been exceeded.');
      },
      removeItem: () => {
        throw new DOMException('Storage unavailable.');
      },
    });
    const storage = createResilientJotaiStorage<string>(() => fakeStorage);

    expect(() => storage.setItem('my-key', 'value')).not.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should fall back to the initial value when a read fails', () => {
    const fakeStorage = buildFakeStorage({
      getItem: () => {
        throw new DOMException('Storage unavailable.');
      },
    });
    const storage = createResilientJotaiStorage<string>(() => fakeStorage);

    expect(storage.getItem('my-key', 'fallback')).toBe('fallback');
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should not throw when removing a key fails', () => {
    const fakeStorage = buildFakeStorage({
      removeItem: () => {
        throw new DOMException('Storage unavailable.');
      },
    });
    const storage = createResilientJotaiStorage<string>(() => fakeStorage);

    expect(() => storage.removeItem('my-key')).not.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
