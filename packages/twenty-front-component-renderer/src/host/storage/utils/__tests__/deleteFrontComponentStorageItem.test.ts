import { buildFrontComponentStorageNamespace } from '../buildFrontComponentStorageNamespace';
import { deleteFrontComponentStorageItem } from '../deleteFrontComponentStorageItem';
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

describe('deleteFrontComponentStorageItem', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('should delete only the namespaced entry', () => {
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

    deleteFrontComponentStorageItem({
      namespace: NAMESPACE,
      storageType: 'localStorage',
      key: 'theme',
    });

    expect(
      snapshotFrontComponentStorage({
        namespace: NAMESPACE,
        storageType: 'localStorage',
      }),
    ).toEqual({ locale: '"en"' });
    expect(
      snapshotFrontComponentStorage({
        namespace: OTHER_APPLICATION_NAMESPACE,
        storageType: 'localStorage',
      }),
    ).toEqual({ theme: '"light"' });
  });
});
