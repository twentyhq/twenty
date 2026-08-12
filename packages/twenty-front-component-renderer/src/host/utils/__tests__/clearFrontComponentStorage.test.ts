import { clearFrontComponentStorage } from '../clearFrontComponentStorage';
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

describe('clearFrontComponentStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('should clear only within the namespace', () => {
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
      ...OTHER_APPLICATION_NAMESPACE,
      area: 'local',
      key: 'theme',
      serializedValue: '"light"',
    });

    setFrontComponentStorageItem({
      ...OTHER_USER_NAMESPACE,
      area: 'local',
      key: 'theme',
      serializedValue: '"system"',
    });

    window.localStorage.setItem('unrelatedTwentyKey', 'value');

    clearFrontComponentStorage({ ...NAMESPACE, area: 'local' });

    expect(
      snapshotFrontComponentStorage({ ...NAMESPACE, area: 'local' }),
    ).toEqual({});
    expect(
      snapshotFrontComponentStorage({
        ...OTHER_APPLICATION_NAMESPACE,
        area: 'local',
      }),
    ).toEqual({ theme: '"light"' });
    expect(
      snapshotFrontComponentStorage({ ...OTHER_USER_NAMESPACE, area: 'local' }),
    ).toEqual({ theme: '"system"' });
    expect(window.localStorage.getItem('unrelatedTwentyKey')).toBe('value');
  });
});
