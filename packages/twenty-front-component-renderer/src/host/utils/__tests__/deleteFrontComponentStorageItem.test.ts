import { deleteFrontComponentStorageItem } from '../deleteFrontComponentStorageItem';
import { setFrontComponentStorageItem } from '../setFrontComponentStorageItem';
import { snapshotFrontComponentStorage } from '../snapshotFrontComponentStorage';

const NAMESPACE = {
  applicationId: 'application-id',
  userId: 'user-id',
};

const OTHER_NAMESPACE = {
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
      area: 'local',
      key: 'theme',
      serializedValue: '"dark"',
    });

    setFrontComponentStorageItem({
      ...NAMESPACE,
      area: 'local',
      key: 'locale',
      serializedValue: '"en"',
    });

    setFrontComponentStorageItem({
      ...OTHER_NAMESPACE,
      area: 'local',
      key: 'theme',
      serializedValue: '"light"',
    });

    deleteFrontComponentStorageItem({
      ...NAMESPACE,
      area: 'local',
      key: 'theme',
    });

    expect(
      snapshotFrontComponentStorage({ ...NAMESPACE, area: 'local' }),
    ).toEqual({ locale: '"en"' });
    expect(
      snapshotFrontComponentStorage({ ...OTHER_NAMESPACE, area: 'local' }),
    ).toEqual({ theme: '"light"' });
  });
});
