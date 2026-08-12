import { buildFrontComponentStorageNamespacePrefix } from '../buildFrontComponentStorageNamespacePrefix';
import { setFrontComponentStorageItem } from '../setFrontComponentStorageItem';
import { snapshotFrontComponentStorage } from '../snapshotFrontComponentStorage';

const NAMESPACE = {
  applicationId: 'application-id',
  userId: 'user-id',
};

const OTHER_APPLICATION_NAMESPACE = {
  applicationId: 'other-application-id',
  userId: 'user-id',
};

const OTHER_USER_NAMESPACE = {
  applicationId: 'application-id',
  userId: 'other-user-id',
};

describe('snapshotFrontComponentStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('should snapshot only the entries of the namespace and storage type', () => {
    setFrontComponentStorageItem({
      ...NAMESPACE,
      storageType: 'localStorage',
      key: 'theme',
      serializedValue: '"dark"',
    });

    setFrontComponentStorageItem({
      ...OTHER_APPLICATION_NAMESPACE,
      storageType: 'localStorage',
      key: 'theme',
      serializedValue: '"light"',
    });

    setFrontComponentStorageItem({
      ...OTHER_USER_NAMESPACE,
      storageType: 'localStorage',
      key: 'theme',
      serializedValue: '"system"',
    });

    setFrontComponentStorageItem({
      ...NAMESPACE,
      storageType: 'sessionStorage',
      key: 'visits',
      serializedValue: '2',
    });

    window.localStorage.setItem('unrelatedTwentyKey', 'value');

    const namespacePrefix =
      buildFrontComponentStorageNamespacePrefix(NAMESPACE);

    expect(window.localStorage.getItem(`${namespacePrefix}theme`)).toBe(
      '"dark"',
    );
    expect(window.sessionStorage.getItem(`${namespacePrefix}visits`)).toBe('2');

    expect(
      snapshotFrontComponentStorage({
        ...NAMESPACE,
        storageType: 'localStorage',
      }),
    ).toEqual({ theme: '"dark"' });
    expect(
      snapshotFrontComponentStorage({
        ...NAMESPACE,
        storageType: 'sessionStorage',
      }),
    ).toEqual({ visits: '2' });
    expect(
      snapshotFrontComponentStorage({
        ...OTHER_APPLICATION_NAMESPACE,
        storageType: 'localStorage',
      }),
    ).toEqual({ theme: '"light"' });
    expect(
      snapshotFrontComponentStorage({
        ...OTHER_USER_NAMESPACE,
        storageType: 'localStorage',
      }),
    ).toEqual({ theme: '"system"' });
  });
});
