import { renderHook } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';

import { SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('useNavigateSettings', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('should navigate to the correct settings path without params', () => {
    const { result } = renderHook(() => useNavigateSettings(), {
      wrapper: Wrapper,
    });

    result.current(SettingsPath.Accounts);

    expect(mockNavigate).toHaveBeenCalledWith('/settings/accounts', undefined);
  });

  it('should navigate to the correct settings path with params', () => {
    const { result } = renderHook(() => useNavigateSettings(), {
      wrapper: Wrapper,
    });

    result.current(SettingsPath.ObjectFieldEdit, {
      objectNamePlural: 'companies',
      fieldName: 'name',
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      '/settings/objects/companies/name',
      undefined,
    );
  });

  it('should navigate with query params', () => {
    const { result } = renderHook(() => useNavigateSettings(), {
      wrapper: Wrapper,
    });

    const queryParams = { viewId: '123', filter: 'test' };
    result.current(SettingsPath.Accounts, undefined, queryParams);

    expect(mockNavigate).toHaveBeenCalledWith(
      '/settings/accounts?viewId=123&filter=test',
      undefined,
    );
  });

  it('should navigate with options', () => {
    const { result } = renderHook(() => useNavigateSettings(), {
      wrapper: Wrapper,
    });

    const options = { replace: true, state: { test: true } };
    result.current(SettingsPath.Accounts, undefined, undefined, options);

    expect(mockNavigate).toHaveBeenCalledWith('/settings/accounts', options);
  });
});
