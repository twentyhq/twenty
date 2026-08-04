import { FRONT_COMPONENT_LOCAL_STORAGE_MAX_KEY_LENGTH } from '@/constants/FrontComponentLocalStorageMaxKeyLength';
import { FRONT_COMPONENT_LOCAL_STORAGE_MAX_TOTAL_LENGTH } from '@/constants/FrontComponentLocalStorageMaxTotalLength';
import { FRONT_COMPONENT_LOCAL_STORAGE_MAX_VALUE_LENGTH } from '@/constants/FrontComponentLocalStorageMaxValueLength';
import { type FrontComponentHostCommunicationApiStore } from '@/types/FrontComponentHostCommunicationApiStore';
import { createFrontComponentLocalStorageBridge } from '../createFrontComponentLocalStorageBridge';

const createHostCommunicationApiStub = () => ({
  localStorageSet: jest.fn(async () => {}),
  localStorageDelete: jest.fn(async () => true),
  localStorageClear: jest.fn(async () => {}),
});

const createConnectedBridge = () => {
  const hostCommunicationApi = createHostCommunicationApiStub();

  return {
    hostCommunicationApi,
    bridge: createFrontComponentLocalStorageBridge({
      getHostCommunicationApi: () =>
        hostCommunicationApi as FrontComponentHostCommunicationApiStore,
    }),
  };
};

describe('createFrontComponentLocalStorageBridge', () => {
  it('should read back seeded entries synchronously', () => {
    const { bridge } = createConnectedBridge();

    bridge.seed({ theme: '"dark"', draft: '"hello"' });

    expect(bridge.getItem('theme')).toBe('"dark"');
    expect(bridge.getKeys()).toEqual(['theme', 'draft']);
    expect(bridge.getLength()).toBe(2);
    expect(bridge.getKeyAtIndex(1)).toBe('draft');
    expect(bridge.getItem('missing')).toBeNull();
  });

  it('should persist writes made through the synchronous shim', async () => {
    const { bridge, hostCommunicationApi } = createConnectedBridge();

    bridge.setItem('theme', '"dark"');

    expect(bridge.getItem('theme')).toBe('"dark"');
    expect(hostCommunicationApi.localStorageSet).toHaveBeenCalledWith(
      'theme',
      '"dark"',
    );
  });

  it('should await the host round trip on the awaitable write', async () => {
    const { bridge, hostCommunicationApi } = createConnectedBridge();

    await bridge.setItemAndPersist('theme', '"dark"');

    expect(hostCommunicationApi.localStorageSet).toHaveBeenCalledWith(
      'theme',
      '"dark"',
    );
  });

  it('should report whether the removed key was present', async () => {
    const { bridge, hostCommunicationApi } = createConnectedBridge();

    bridge.seed({ theme: '"dark"' });

    await expect(bridge.removeItemAndPersist('theme')).resolves.toBe(true);
    await expect(bridge.removeItemAndPersist('theme')).resolves.toBe(false);
    expect(hostCommunicationApi.localStorageDelete).toHaveBeenCalledTimes(2);
  });

  it('should clear every entry', async () => {
    const { bridge, hostCommunicationApi } = createConnectedBridge();

    bridge.seed({ theme: '"dark"', draft: '"hello"' });

    await bridge.clearAndPersist();

    expect(bridge.getKeys()).toEqual([]);
    expect(hostCommunicationApi.localStorageClear).toHaveBeenCalled();
  });

  it('should reject keys longer than the limit', async () => {
    const { bridge, hostCommunicationApi } = createConnectedBridge();

    const oversizedKey = 'k'.repeat(
      FRONT_COMPONENT_LOCAL_STORAGE_MAX_KEY_LENGTH + 1,
    );

    await expect(
      bridge.setItemAndPersist(oversizedKey, '"a"'),
    ).rejects.toMatchObject({
      code: 'FRONT_COMPONENT_STORAGE_KEY_TOO_LONG',
    });
    expect(hostCommunicationApi.localStorageSet).not.toHaveBeenCalled();
  });

  it('should reject values larger than the limit', async () => {
    const { bridge } = createConnectedBridge();

    const oversizedValue = 'v'.repeat(
      FRONT_COMPONENT_LOCAL_STORAGE_MAX_VALUE_LENGTH + 1,
    );

    await expect(
      bridge.setItemAndPersist('draft', oversizedValue),
    ).rejects.toMatchObject({
      code: 'FRONT_COMPONENT_STORAGE_VALUE_TOO_LARGE',
    });
    expect(bridge.getItem('draft')).toBeNull();
  });

  it('should reject writes that exceed the total budget', async () => {
    const { bridge } = createConnectedBridge();

    const chunk = 'v'.repeat(FRONT_COMPONENT_LOCAL_STORAGE_MAX_VALUE_LENGTH);
    const chunkCount = Math.floor(
      FRONT_COMPONENT_LOCAL_STORAGE_MAX_TOTAL_LENGTH /
        FRONT_COMPONENT_LOCAL_STORAGE_MAX_VALUE_LENGTH,
    );

    for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
      await bridge.setItemAndPersist(`chunk-${chunkIndex}`, chunk);
    }

    await expect(
      bridge.setItemAndPersist('overflow', 'v'),
    ).rejects.toMatchObject({
      code: 'FRONT_COMPONENT_STORAGE_QUOTA_EXCEEDED',
    });
  });

  it('should not count the overwritten value twice against the budget', async () => {
    const { bridge } = createConnectedBridge();

    const chunk = 'v'.repeat(FRONT_COMPONENT_LOCAL_STORAGE_MAX_VALUE_LENGTH);
    const chunkCount = Math.floor(
      FRONT_COMPONENT_LOCAL_STORAGE_MAX_TOTAL_LENGTH /
        FRONT_COMPONENT_LOCAL_STORAGE_MAX_VALUE_LENGTH,
    );

    for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
      await bridge.setItemAndPersist(`chunk-${chunkIndex}`, chunk);
    }

    await expect(
      bridge.setItemAndPersist('chunk-0', chunk),
    ).resolves.toBeUndefined();
  });

  it('should throw a QuotaExceededError from the synchronous shim', () => {
    const { bridge } = createConnectedBridge();

    const oversizedValue = 'v'.repeat(
      FRONT_COMPONENT_LOCAL_STORAGE_MAX_VALUE_LENGTH + 1,
    );

    expect(() => bridge.setItem('draft', oversizedValue)).toThrow(
      expect.objectContaining({ name: 'QuotaExceededError' }),
    );
  });

  it('should queue writes made before the host api is available and flush them in order', async () => {
    const hostCommunicationApi: FrontComponentHostCommunicationApiStore = {};

    const bridge = createFrontComponentLocalStorageBridge({
      getHostCommunicationApi: () => hostCommunicationApi,
    });

    const persistPromise = bridge.setItemAndPersist('theme', '"dark"');
    bridge.setItem('draft', '"hello"');

    expect(bridge.getItem('theme')).toBe('"dark"');

    const localStorageSet = jest.fn(async () => {});
    hostCommunicationApi.localStorageSet = localStorageSet;

    bridge.flushPendingPersistOperations();

    await expect(persistPromise).resolves.toBeUndefined();
    expect(localStorageSet.mock.calls).toEqual([
      ['theme', '"dark"'],
      ['draft', '"hello"'],
    ]);
  });

  it('should surface host persistence failures on the awaitable write', async () => {
    const { bridge, hostCommunicationApi } = createConnectedBridge();

    hostCommunicationApi.localStorageSet.mockRejectedValueOnce(
      new Error('host is down'),
    );

    await expect(bridge.setItemAndPersist('theme', '"dark"')).rejects.toThrow(
      'host is down',
    );
  });

  it('should roll back a write the host refused to persist', async () => {
    const { bridge, hostCommunicationApi } = createConnectedBridge();

    bridge.seed({ theme: '"dark"' });

    hostCommunicationApi.localStorageSet.mockRejectedValueOnce(
      new Error('host is down'),
    );

    await expect(bridge.setItemAndPersist('theme', '"light"')).rejects.toThrow(
      'host is down',
    );
    expect(bridge.getItem('theme')).toBe('"dark"');
  });

  it('should drop a refused write of a key that did not exist before', async () => {
    const { bridge, hostCommunicationApi } = createConnectedBridge();

    hostCommunicationApi.localStorageSet.mockRejectedValueOnce(
      new Error('host is down'),
    );

    await expect(bridge.setItemAndPersist('theme', '"dark"')).rejects.toThrow(
      'host is down',
    );
    expect(bridge.getItem('theme')).toBeNull();
    expect(bridge.getKeys()).toEqual([]);
  });

  it('should restore an entry the host refused to delete', async () => {
    const { bridge, hostCommunicationApi } = createConnectedBridge();

    bridge.seed({ theme: '"dark"' });

    hostCommunicationApi.localStorageDelete.mockRejectedValueOnce(
      new Error('host is down'),
    );

    await expect(bridge.removeItemAndPersist('theme')).rejects.toThrow(
      'host is down',
    );
    expect(bridge.getItem('theme')).toBe('"dark"');
  });

  it('should restore every entry when the host refuses to clear', async () => {
    const { bridge, hostCommunicationApi } = createConnectedBridge();

    bridge.seed({ theme: '"dark"', draft: '"hello"' });

    hostCommunicationApi.localStorageClear.mockRejectedValueOnce(
      new Error('host is down'),
    );

    await expect(bridge.clearAndPersist()).rejects.toThrow('host is down');
    expect(bridge.getKeys()).toEqual(['theme', 'draft']);
    expect(bridge.getItem('draft')).toBe('"hello"');
  });

  it('should not let a refused write roll back a newer write of the same key', async () => {
    const { bridge, hostCommunicationApi } = createConnectedBridge();

    hostCommunicationApi.localStorageSet.mockRejectedValueOnce(
      new Error('host is down'),
    );

    const refusedWrite = bridge.setItemAndPersist('theme', '"dark"');
    const refusedWriteMessage = refusedWrite.then(
      () => 'resolved',
      (error: Error) => error.message,
    );

    await bridge.setItemAndPersist('theme', '"light"');

    expect(await refusedWriteMessage).toBe('host is down');
    expect(bridge.getItem('theme')).toBe('"light"');
  });
});
