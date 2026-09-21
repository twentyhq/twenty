import { buildFrontComponentStorageNamespace } from '../buildFrontComponentStorageNamespace';
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

describe('snapshotFrontComponentStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('should snapshot only the entries of the namespace and storage type', () => {
    setFrontComponentStorageItem({
      namespace: NAMESPACE,
      storageType: 'localStorage',
      key: 'theme',
      serializedValue: '"dark"',
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

    setFrontComponentStorageItem({
      namespace: NAMESPACE,
      storageType: 'sessionStorage',
      key: 'visits',
      serializedValue: '2',
    });

    window.localStorage.setItem('unrelatedTwentyKey', 'value');

    expect(window.localStorage.getItem(`${NAMESPACE}theme`)).toBe('"dark"');
    expect(window.sessionStorage.getItem(`${NAMESPACE}visits`)).toBe('2');

    expect(
      snapshotFrontComponentStorage({
        namespace: NAMESPACE,
        storageType: 'localStorage',
      }),
    ).toEqual({ theme: '"dark"' });
    expect(
      snapshotFrontComponentStorage({
        namespace: NAMESPACE,
        storageType: 'sessionStorage',
      }),
    ).toEqual({ visits: '2' });
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
  });
});
