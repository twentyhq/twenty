import { deleteFrontComponentStorageItem } from '../deleteFrontComponentStorageItem';
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

describe('deleteFrontComponentStorageItem', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('should delete only the namespaced entry', () => {
    setFrontComponentStorageItem({
      ...NAMESPACE,
      storageType: 'localStorage',
      key: 'theme',
      serializedValue: '"dark"',
    });

    setFrontComponentStorageItem({
      ...NAMESPACE,
      storageType: 'localStorage',
      key: 'locale',
      serializedValue: '"en"',
    });

    setFrontComponentStorageItem({
      ...OTHER_APPLICATION_NAMESPACE,
      storageType: 'localStorage',
      key: 'theme',
      serializedValue: '"light"',
    });

    deleteFrontComponentStorageItem({
      ...NAMESPACE,
      storageType: 'localStorage',
      key: 'theme',
    });

    expect(
      snapshotFrontComponentStorage({
        ...NAMESPACE,
        storageType: 'localStorage',
      }),
    ).toEqual({ locale: '"en"' });
    expect(
      snapshotFrontComponentStorage({
        ...OTHER_APPLICATION_NAMESPACE,
        storageType: 'localStorage',
      }),
    ).toEqual({ theme: '"light"' });
  });
});
