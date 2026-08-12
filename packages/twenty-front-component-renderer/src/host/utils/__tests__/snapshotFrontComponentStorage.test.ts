import { buildFrontComponentStorageKeyPrefix } from '../buildFrontComponentStorageKeyPrefix';
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

describe('snapshotFrontComponentStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('should snapshot only the entries of the namespace and area', () => {
    setFrontComponentStorageItem({
      ...NAMESPACE,
      area: 'local',
      key: 'theme',
      serializedValue: '"dark"',
    });

    setFrontComponentStorageItem({
      ...OTHER_NAMESPACE,
      area: 'local',
      key: 'theme',
      serializedValue: '"light"',
    });

    setFrontComponentStorageItem({
      ...NAMESPACE,
      area: 'session',
      key: 'visits',
      serializedValue: '2',
    });

    window.localStorage.setItem('unrelatedTwentyKey', 'value');

    const keyPrefix = buildFrontComponentStorageKeyPrefix(NAMESPACE);

    expect(window.localStorage.getItem(`${keyPrefix}theme`)).toBe('"dark"');
    expect(window.sessionStorage.getItem(`${keyPrefix}visits`)).toBe('2');

    expect(
      snapshotFrontComponentStorage({ ...NAMESPACE, area: 'local' }),
    ).toEqual({ theme: '"dark"' });
    expect(
      snapshotFrontComponentStorage({ ...NAMESPACE, area: 'session' }),
    ).toEqual({ visits: '2' });
  });
});
