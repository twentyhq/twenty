import { AppBasePath } from 'twenty-shared/types';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

describe('isMatchingLocation', () => {
  it('returns true when paths match with no basePath', () => {
    const location = {
      pathname: '/example',
      state: null,
      key: 'test-key',
      search: '',
      hash: '',
    };
    const result = isMatchingLocation(location, '/example');
    expect(result).toBe(true);
  });

  it('returns false when paths do not match with no basePath', () => {
    const location = {
      pathname: '/example',
      state: null,
      key: 'test-key',
      search: '',
      hash: '',
    };
    const result = isMatchingLocation(location, '/non-match');
    expect(result).toBe(false);
  });

  it('returns true when paths match with basePath', () => {
    const location = {
      pathname: `${AppBasePath.Settings}/example`,
      state: null,
      key: 'test-key',
      search: '',
      hash: '',
    };
    const result = isMatchingLocation(
      location,
      'example',
      AppBasePath.Settings,
    );
    expect(result).toBe(true);
  });

  it('returns false when paths do not match with basePath', () => {
    const location = {
      pathname: `${AppBasePath.Settings}/example`,
      state: null,
      key: 'test-key',
      search: '',
      hash: '',
    };

    const result = isMatchingLocation(
      location,
      'non-match',
      AppBasePath.Settings,
    );
    expect(result).toBe(false);
  });

  it('handles trailing slashes in basePath correctly', () => {
    const location = {
      pathname: `${AppBasePath.Settings}/example`,
      state: null,
      key: 'test-key',
      search: '',
      hash: '',
    };
    const result = isMatchingLocation(
      location,
      'example',
      (AppBasePath.Settings + '/') as AppBasePath,
    );
    expect(result).toBe(true);
  });

  it('handles paths without basePath correctly', () => {
    const location = {
      pathname: '/example',
      state: null,
      key: 'test-key',
      search: '',
      hash: '',
    };
    const result = isMatchingLocation(location, '/example');
    expect(result).toBe(true);
  });
});
