import { FRONT_COMPONENT_STORAGE_MAX_VALUE_LENGTH } from '@/constants/FrontComponentStorageMaxValueLength';
import { setFrontComponentStorageItem } from '../setFrontComponentStorageItem';
import { snapshotFrontComponentStorage } from '../snapshotFrontComponentStorage';

const NAMESPACE = {
  applicationId: 'application-id',
  userId: 'user-id',
};

describe('setFrontComponentStorageItem', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('should refuse a write whose key or value is not a string', () => {
    expect(() =>
      setFrontComponentStorageItem({
        ...NAMESPACE,
        area: 'local',
        key: 'draft',
        serializedValue: ['value'] as unknown as string,
      }),
    ).toThrow('Storage keys and values must be strings');

    expect(() =>
      setFrontComponentStorageItem({
        ...NAMESPACE,
        area: 'local',
        key: ['draft'] as unknown as string,
        serializedValue: 'value',
      }),
    ).toThrow('Storage keys and values must be strings');

    expect(
      snapshotFrontComponentStorage({ ...NAMESPACE, area: 'local' }),
    ).toEqual({});
  });

  it('should refuse a write that breaks the limits', () => {
    expect(() =>
      setFrontComponentStorageItem({
        ...NAMESPACE,
        area: 'local',
        key: 'draft',
        serializedValue: 'v'.repeat(
          FRONT_COMPONENT_STORAGE_MAX_VALUE_LENGTH + 1,
        ),
      }),
    ).toThrow(
      expect.objectContaining({
        code: 'FRONT_COMPONENT_STORAGE_LIMIT_EXCEEDED',
      }),
    );

    expect(
      snapshotFrontComponentStorage({ ...NAMESPACE, area: 'local' }),
    ).toEqual({});
  });
});
