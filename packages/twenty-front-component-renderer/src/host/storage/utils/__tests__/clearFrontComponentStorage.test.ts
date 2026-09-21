import { buildFrontComponentStorageNamespace } from '../buildFrontComponentStorageNamespace';
import { clearFrontComponentStorage } from '../clearFrontComponentStorage';
import { setFrontComponentStorageItem } from '../setFrontComponentStorageItem';
import { snapshotFrontComponentStorage } from '../snapshotFrontComponentStorage';

const NAMESPACE = buildFrontComponentStorageNamespace({
  applicationId: 'application-id',
  userId: 'user-id',
});

const OTHER_APPLICATION_NAMESPACE = buildFrontComponentStorageNamespace({
  applicationId: 'other-application-id',
  userId: 'user-id',
});

const OTHER_USER_NAMESPACE = buildFrontComponentStorageNamespace({
  applicationId: 'application-id',
  userId: 'other-user-id',
});

describe('clearFrontComponentStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('should clear only within the namespace', () => {
    setFrontComponentStorageItem({
      namespace: NAMESPACE,
      storageType: 'localStorage',
      key: 'theme',
      serializedValue: '"dark"',
    });

    setFrontComponentStorageItem({
      namespace: NAMESPACE,
      storageType: 'localStorage',
      key: 'locale',
      serializedValue: '"en"',
    });

    setFrontComponentStorageItem({
      namespace: OTHER_APPLICATION_NAMESPACE,
      storageType: 'localStorage',
      key: 'theme',
      serializedValue: '"light"',
    });

    setFrontComponentStorageItem({
      namespace: OTHER_USER_NAMESPACE,
      storageType: 'localStorage',
      key: 'theme',
      serializedValue: '"system"',
    });

    window.localStorage.setItem('unrelatedTwentyKey', 'value');

    clearFrontComponentStorage({
      namespace: NAMESPACE,
      storageType: 'localStorage',
    });

    expect(
      snapshotFrontComponentStorage({
        namespace: NAMESPACE,
        storageType: 'localStorage',
      }),
    ).toEqual({});
    expect(
      snapshotFrontComponentStorage({
        namespace: OTHER_APPLICATION_NAMESPACE,
        storageType: 'localStorage',
      }),
    ).toEqual({ theme: '"light"' });
    expect(
      snapshotFrontComponentStorage({
        namespace: OTHER_USER_NAMESPACE,
        storageType: 'localStorage',
      }),
    ).toEqual({ theme: '"system"' });
    expect(window.localStorage.getItem('unrelatedTwentyKey')).toBe('value');
  });
});
