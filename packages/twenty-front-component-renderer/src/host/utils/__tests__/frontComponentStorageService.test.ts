import { FRONT_COMPONENT_STORAGE_MAX_VALUE_LENGTH } from '@/constants/FrontComponentStorageMaxValueLength';
import { buildFrontComponentStorageKeyPrefix } from '../buildFrontComponentStorageKeyPrefix';
import { frontComponentStorageService } from '../frontComponentStorageService';

const NAMESPACE = {
  applicationId: 'application-id',
  userId: 'user-id',
};

const OTHER_NAMESPACE = {
  applicationId: 'other-application-id',
  userId: 'user-id',
};

describe('frontComponentStorageService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('should snapshot only the entries of the namespace and area', () => {
    frontComponentStorageService.set({
      ...NAMESPACE,
      area: 'local',
      key: 'theme',
      serializedValue: '"dark"',
    });

    frontComponentStorageService.set({
      ...OTHER_NAMESPACE,
      area: 'local',
      key: 'theme',
      serializedValue: '"light"',
    });

    frontComponentStorageService.set({
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
      frontComponentStorageService.snapshot({ ...NAMESPACE, area: 'local' }),
    ).toEqual({ theme: '"dark"' });
    expect(
      frontComponentStorageService.snapshot({ ...NAMESPACE, area: 'session' }),
    ).toEqual({ visits: '2' });
  });

  it('should delete and clear only within the namespace', () => {
    frontComponentStorageService.set({
      ...NAMESPACE,
      area: 'local',
      key: 'theme',
      serializedValue: '"dark"',
    });

    frontComponentStorageService.set({
      ...NAMESPACE,
      area: 'local',
      key: 'locale',
      serializedValue: '"en"',
    });

    frontComponentStorageService.set({
      ...OTHER_NAMESPACE,
      area: 'local',
      key: 'theme',
      serializedValue: '"light"',
    });

    window.localStorage.setItem('unrelatedTwentyKey', 'value');

    frontComponentStorageService.delete({
      ...NAMESPACE,
      area: 'local',
      key: 'theme',
    });

    expect(
      frontComponentStorageService.snapshot({ ...NAMESPACE, area: 'local' }),
    ).toEqual({ locale: '"en"' });

    frontComponentStorageService.clear({ ...NAMESPACE, area: 'local' });

    expect(
      frontComponentStorageService.snapshot({ ...NAMESPACE, area: 'local' }),
    ).toEqual({});
    expect(
      frontComponentStorageService.snapshot({
        ...OTHER_NAMESPACE,
        area: 'local',
      }),
    ).toEqual({ theme: '"light"' });
    expect(window.localStorage.getItem('unrelatedTwentyKey')).toBe('value');
  });

  it('should refuse a write whose key or value is not a string', () => {
    expect(() =>
      frontComponentStorageService.set({
        ...NAMESPACE,
        area: 'local',
        key: 'draft',
        serializedValue: ['value'] as unknown as string,
      }),
    ).toThrow('Storage keys and values must be strings');

    expect(() =>
      frontComponentStorageService.set({
        ...NAMESPACE,
        area: 'local',
        key: ['draft'] as unknown as string,
        serializedValue: 'value',
      }),
    ).toThrow('Storage keys and values must be strings');

    expect(
      frontComponentStorageService.snapshot({ ...NAMESPACE, area: 'local' }),
    ).toEqual({});
  });

  it('should refuse a write that breaks the limits', () => {
    expect(() =>
      frontComponentStorageService.set({
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
      frontComponentStorageService.snapshot({ ...NAMESPACE, area: 'local' }),
    ).toEqual({});
  });
});
