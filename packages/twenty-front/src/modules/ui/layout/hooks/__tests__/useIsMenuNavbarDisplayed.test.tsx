import * as reactRouterDom from 'react-router-dom';

import { useIsMenuNavbarDisplayed } from '../useIsMenuNavbarDisplayed';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

const setupMockLocation = (pathname: string) => {
  jest.spyOn(reactRouterDom, 'useLocation').mockReturnValueOnce({
    pathname,
    state: undefined,
    key: '',
    search: '',
    hash: '',
  });
};

describe('useIsMenuNavbarDisplayed', () => {
  it('Should return true for paths starting with "/companies"', () => {
    setupMockLocation('/companies');

    const result = useIsMenuNavbarDisplayed();
    expect(result).toBeTruthy();
  });

  it('Should return true for paths starting with "/companies/"', () => {
    setupMockLocation('/companies/test-some-subpath');

    const result = useIsMenuNavbarDisplayed();
    expect(result).toBeTruthy();
  });

  it('Should return false for paths not starting with "/companies"', () => {
    setupMockLocation('/test-path');

    const result = useIsMenuNavbarDisplayed();
    expect(result).toBeFalsy();
  });
});
