import { FRONT_COMPONENT_STORAGE_MAX_TOTAL_LENGTH } from '@/constants/FrontComponentStorageMaxTotalLength';
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

  it('should write namespaced keys to the matching browser storage', () => {
    frontComponentStorageService.set({
      ...NAMESPACE,
      area: 'local',
      key: 'theme',
      serializedValue: '"dark"',
    });

    frontComponentStorageService.set({
      ...NAMESPACE,
      area: 'session',
      key: 'visits',
      serializedValue: '2',
    });

    const keyPrefix = buildFrontComponentStorageKeyPrefix(NAMESPACE);

    expect(window.localStorage.getItem(`${keyPrefix}theme`)).toBe('"dark"');
    expect(window.localStorage.getItem(`${keyPrefix}visits`)).toBeNull();
    expect(window.sessionStorage.getItem(`${keyPrefix}visits`)).toBe('2');
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

    expect(
      frontComponentStorageService.snapshot({ ...NAMESPACE, area: 'local' }),
    ).toEqual({ theme: '"dark"' });
    expect(
      frontComponentStorageService.snapshot({ ...NAMESPACE, area: 'session' }),
    ).toEqual({ visits: '2' });
  });

  it('should delete a single namespaced entry', () => {
    frontComponentStorageService.set({
      ...NAMESPACE,
      area: 'local',
      key: 'theme',
      serializedValue: '"dark"',
    });

    frontComponentStorageService.delete({
      ...NAMESPACE,
      area: 'local',
      key: 'theme',
    });

    expect(
      frontComponentStorageService.snapshot({ ...NAMESPACE, area: 'local' }),
    ).toEqual({});
  });

  it('should clear only the entries of the namespace', () => {
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

    window.localStorage.setItem('unrelatedTwentyKey', 'value');

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
    const oversizedValue = 'v'.repeat(
      FRONT_COMPONENT_STORAGE_MAX_VALUE_LENGTH + 1,
    );

    expect(() =>
      frontComponentStorageService.set({
        ...NAMESPACE,
        area: 'local',
        key: 'draft',
        serializedValue: [oversizedValue] as unknown as string,
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
    const oversizedValue = 'v'.repeat(
      FRONT_COMPONENT_STORAGE_MAX_VALUE_LENGTH + 1,
    );

    expect(() =>
      frontComponentStorageService.set({
        ...NAMESPACE,
        area: 'local',
        key: 'draft',
        serializedValue: oversizedValue,
      }),
    ).toThrow('Storage values cannot exceed');

    expect(
      frontComponentStorageService.snapshot({ ...NAMESPACE, area: 'local' }),
    ).toEqual({});
  });

  it('should count key lengths toward the total quota', () => {
    const keyPrefix = buildFrontComponentStorageKeyPrefix(NAMESPACE);

    window.localStorage.setItem(
      `${keyPrefix}a`,
      'v'.repeat(FRONT_COMPONENT_STORAGE_MAX_TOTAL_LENGTH - 2),
    );

    expect(() =>
      frontComponentStorageService.set({
        ...NAMESPACE,
        area: 'local',
        key: 'b',
        serializedValue: 'v',
      }),
    ).toThrow('Storage quota');
  });
});
