import { FRONT_COMPONENT_STORAGE_MAX_KEY_LENGTH } from '@/constants/FrontComponentStorageMaxKeyLength';
import { createFrontComponentStorageBridge } from '../createFrontComponentStorageBridge';

const createHostCommunicationApiStub = () => ({
  storageSet: jest.fn(async () => {}),
  storageDelete: jest.fn(async () => {}),
  storageClear: jest.fn(async () => {}),
});

const createConnectedBridge = () => {
  const hostCommunicationApi = createHostCommunicationApiStub();

  const bridge = createFrontComponentStorageBridge({
    storageType: 'localStorage',
  });

  bridge.connectHostCommunicationApi(hostCommunicationApi);

  return { hostCommunicationApi, bridge };
};

const flushPendingPromises = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

describe('createFrontComponentStorageBridge', () => {
  it('should enumerate keys in insertion order across mutations', () => {
    const { bridge } = createConnectedBridge();

    bridge.seed({ theme: '"dark"', draft: '"hello"' });

    const enumerateKeys = () =>
      Array.from({ length: bridge.getLength() }, (_unused, index) =>
        bridge.getKeyAtIndex(index),
      );

    expect(enumerateKeys()).toEqual(['theme', 'draft']);
    expect(bridge.getItem('theme')).toBe('"dark"');
    expect(bridge.getItem('missing')).toBeNull();

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

  it('should apply writes locally and persist them with the storage type', () => {
    const { bridge, hostCommunicationApi } = createConnectedBridge();

    bridge.setItem('theme', '"dark"');

    expect(bridge.getItem('theme')).toBe('"dark"');
    expect(hostCommunicationApi.storageSet).toHaveBeenCalledWith({
      storageType: 'localStorage',
      key: 'theme',
      serializedValue: '"dark"',
    });
  });

  it('should persist deletions and clears with the storage type', () => {
    const { bridge, hostCommunicationApi } = createConnectedBridge();

    bridge.seed({ theme: '"dark"', draft: '"hello"' });

    bridge.removeItem('theme');

    expect(bridge.getItem('theme')).toBeNull();
    expect(hostCommunicationApi.storageDelete).toHaveBeenCalledWith({
      storageType: 'localStorage',
      key: 'theme',
    });

    bridge.clear();

    expect(bridge.getLength()).toBe(0);
    expect(hostCommunicationApi.storageClear).toHaveBeenCalledWith({
      storageType: 'localStorage',
    });
  });

  it('should queue writes until the host communication api is connected', () => {
    const bridge = createFrontComponentStorageBridge({
      storageType: 'localStorage',
    });

    bridge.setItem('theme', '"dark"');

    expect(bridge.getItem('theme')).toBe('"dark"');

    const hostCommunicationApi = createHostCommunicationApiStub();

    bridge.connectHostCommunicationApi(hostCommunicationApi);

    expect(hostCommunicationApi.storageSet).toHaveBeenCalledWith({
      storageType: 'localStorage',
      key: 'theme',
      serializedValue: '"dark"',
    });
  });

  it('should reject an oversized key without caching or persisting it', () => {
    const { bridge, hostCommunicationApi } = createConnectedBridge();

    const oversizedKey = 'k'.repeat(FRONT_COMPONENT_STORAGE_MAX_KEY_LENGTH + 1);

    expect(() => bridge.setItem(oversizedKey, '"a"')).toThrow(
      expect.objectContaining({ name: 'QuotaExceededError' }),
    );
    expect(bridge.getItem(oversizedKey)).toBeNull();
    expect(hostCommunicationApi.storageSet).not.toHaveBeenCalled();
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
      storageType: 'localStorage',
    });

    bridge.connectHostCommunicationApi(hostCommunicationApi);

    bridge.setItem('theme', '"dark"');

    await flushPendingPromises();

    expect(bridge.getItem('theme')).toBe('"dark"');
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});
