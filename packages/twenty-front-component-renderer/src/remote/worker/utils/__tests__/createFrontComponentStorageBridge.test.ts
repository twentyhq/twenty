import { FRONT_COMPONENT_STORAGE_MAX_KEY_LENGTH } from '@/constants/FrontComponentStorageMaxKeyLength';
import { FRONT_COMPONENT_STORAGE_MAX_TOTAL_LENGTH } from '@/constants/FrontComponentStorageMaxTotalLength';
import { FRONT_COMPONENT_STORAGE_MAX_VALUE_LENGTH } from '@/constants/FrontComponentStorageMaxValueLength';
import { type FrontComponentHostCommunicationApiStore } from '@/types/FrontComponentHostCommunicationApiStore';
import { createFrontComponentStorageBridge } from '../createFrontComponentStorageBridge';

const createHostCommunicationApiStub = () => ({
  storageSet: jest.fn(async () => {}),
  storageDelete: jest.fn(async () => {}),
  storageClear: jest.fn(async () => {}),
});

const createConnectedBridge = () => {
  const hostCommunicationApi = createHostCommunicationApiStub();

  return {
    hostCommunicationApi,
    bridge: createFrontComponentStorageBridge({
      area: 'local',
      getHostCommunicationApi: () =>
        hostCommunicationApi as FrontComponentHostCommunicationApiStore,
    }),
  };
};

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('createFrontComponentStorageBridge', () => {
  it('should read back seeded entries synchronously', () => {
    const { bridge } = createConnectedBridge();

    bridge.seed({ theme: '"dark"', draft: '"hello"' });

    expect(bridge.getItem('theme')).toBe('"dark"');
    expect(bridge.getLength()).toBe(2);
    expect(bridge.getKeyAtIndex(1)).toBe('draft');
    expect(bridge.getItem('missing')).toBeNull();
  });

  it('should enumerate keys in insertion order across mutations', () => {
    const { bridge } = createConnectedBridge();

    bridge.seed({ theme: '"dark"', draft: '"hello"' });

    const enumerateKeys = () =>
      Array.from({ length: bridge.getLength() }, (_unused, index) =>
        bridge.getKeyAtIndex(index),
      );

    expect(enumerateKeys()).toEqual(['theme', 'draft']);

    bridge.setItem('locale', '"en"');

    expect(enumerateKeys()).toEqual(['theme', 'draft', 'locale']);

    bridge.removeItem('theme');

    expect(enumerateKeys()).toEqual(['draft', 'locale']);

    bridge.setItem('draft', '"updated"');

    expect(enumerateKeys()).toEqual(['draft', 'locale']);

    bridge.clear();

    expect(enumerateKeys()).toEqual([]);
    expect(bridge.getKeyAtIndex(0)).toBeNull();
  });

  it('should apply writes locally and persist them with the area', () => {
    const { bridge, hostCommunicationApi } = createConnectedBridge();

    bridge.setItem('theme', '"dark"');

    expect(bridge.getItem('theme')).toBe('"dark"');
    expect(hostCommunicationApi.storageSet).toHaveBeenCalledWith(
      'local',
      'theme',
      '"dark"',
    );
  });

  it('should persist deletions and clears with the area', () => {
    const { bridge, hostCommunicationApi } = createConnectedBridge();

    bridge.seed({ theme: '"dark"', draft: '"hello"' });

    bridge.removeItem('theme');

    expect(bridge.getItem('theme')).toBeNull();
    expect(hostCommunicationApi.storageDelete).toHaveBeenCalledWith(
      'local',
      'theme',
    );

    bridge.clear();

    expect(bridge.getLength()).toBe(0);
    expect(hostCommunicationApi.storageClear).toHaveBeenCalledWith('local');
  });

  it('should tag persisted writes with the session area', () => {
    const hostCommunicationApi = createHostCommunicationApiStub();

    const bridge = createFrontComponentStorageBridge({
      area: 'session',
      getHostCommunicationApi: () =>
        hostCommunicationApi as FrontComponentHostCommunicationApiStore,
    });

    bridge.setItem('visits', '2');

    expect(hostCommunicationApi.storageSet).toHaveBeenCalledWith(
      'session',
      'visits',
      '2',
    );
  });

  it('should queue writes until the host communication api is available', () => {
    const hostCommunicationApi: FrontComponentHostCommunicationApiStore = {};

    const bridge = createFrontComponentStorageBridge({
      area: 'local',
      getHostCommunicationApi: () => hostCommunicationApi,
    });

    bridge.setItem('theme', '"dark"');

    expect(bridge.getItem('theme')).toBe('"dark"');

    const storageSet = jest.fn(async () => {});
    hostCommunicationApi.storageSet = storageSet;

    bridge.flushPendingPersistOperations();

    expect(storageSet).toHaveBeenCalledWith('local', 'theme', '"dark"');
  });

  it('should reject keys longer than the limit', () => {
    const { bridge, hostCommunicationApi } = createConnectedBridge();

    const oversizedKey = 'k'.repeat(FRONT_COMPONENT_STORAGE_MAX_KEY_LENGTH + 1);

    expect(() => bridge.setItem(oversizedKey, '"a"')).toThrow(
      expect.objectContaining({ name: 'QuotaExceededError' }),
    );
    expect(bridge.getItem(oversizedKey)).toBeNull();
    expect(hostCommunicationApi.storageSet).not.toHaveBeenCalled();
  });

  it('should reject values larger than the limit', () => {
    const { bridge } = createConnectedBridge();

    const oversizedValue = 'v'.repeat(
      FRONT_COMPONENT_STORAGE_MAX_VALUE_LENGTH + 1,
    );

    expect(() => bridge.setItem('draft', oversizedValue)).toThrow(
      expect.objectContaining({ name: 'QuotaExceededError' }),
    );
  });

  it('should reject writes exceeding the total quota', () => {
    const { bridge } = createConnectedBridge();

    const almostFullValue = 'v'.repeat(
      FRONT_COMPONENT_STORAGE_MAX_VALUE_LENGTH,
    );
    const entryCount = Math.ceil(
      FRONT_COMPONENT_STORAGE_MAX_TOTAL_LENGTH /
        FRONT_COMPONENT_STORAGE_MAX_VALUE_LENGTH,
    );

    bridge.seed(
      Object.fromEntries(
        Array.from({ length: entryCount }, (_unused, index) => [
          `entry-${index}`,
          almostFullValue,
        ]),
      ),
    );

    expect(() => bridge.setItem('overflow', 'v')).toThrow(
      expect.objectContaining({ name: 'QuotaExceededError' }),
    );
  });

  it('should keep the local write when the host refuses it', async () => {
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const hostCommunicationApi = createHostCommunicationApiStub();
    hostCommunicationApi.storageSet.mockRejectedValue(
      new Error('Device storage is unavailable'),
    );

    const bridge = createFrontComponentStorageBridge({
      area: 'local',
      getHostCommunicationApi: () =>
        hostCommunicationApi as unknown as FrontComponentHostCommunicationApiStore,
    });

    bridge.setItem('theme', '"dark"');

    await flushMicrotasks();

    expect(bridge.getItem('theme')).toBe('"dark"');
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});
