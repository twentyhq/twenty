import { renderHook } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';

import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const openSettingsMenuMock = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('@/navigation/hooks/useOpenSettings', () => ({
  useOpenSettingsMenu: () => ({ openSettingsMenu: openSettingsMenuMock }),
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

const SidePanelWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <WorkspaceSurfaceContext.Provider
      value={{
        type: 'side-panel',
        instanceId: 'side-panel-page',
        ownsRouteLocation: false,
      }}
    >
      {children}
    </WorkspaceSurfaceContext.Provider>
  </MemoryRouter>
);

const RoutedSidePanelWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <MemoryRouter>
    <WorkspaceSurfaceContext.Provider
      value={{
        type: 'side-panel',
        instanceId: 'side-panel-page',
        ownsRouteLocation: true,
      }}
    >
      {children}
    </WorkspaceSurfaceContext.Provider>
  </MemoryRouter>
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

  it('opens settings when a legacy side-panel page navigates to settings', () => {
    const { result } = renderHook(() => useNavigateSettings(), {
      wrapper: SidePanelWrapper,
    });

    result.current(SettingsPath.NewAccount);

    expect(openSettingsMenuMock).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      '/settings/accounts/new',
      undefined,
    );
  });

  it('leaves settings shell handling to a routed side-panel navigator', () => {
    const { result } = renderHook(() => useNavigateSettings(), {
      wrapper: RoutedSidePanelWrapper,
    });

    result.current(SettingsPath.NewAccount);

    expect(openSettingsMenuMock).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(
      '/settings/accounts/new',
      undefined,
    );
  });

  it('opens settings when a legacy side-panel page escapes to main', () => {
    const { result } = renderHook(() => useNavigateSettings(), {
      wrapper: SidePanelWrapper,
    });

    result.current(SettingsPath.NewAccount, undefined, undefined, {
      surface: 'main',
    });

    expect(openSettingsMenuMock).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/settings/accounts/new', {
      surface: 'main',
    });
  });

  it('leaves the shell to the navigator when a routed page escapes to main', () => {
    const { result } = renderHook(() => useNavigateSettings(), {
      wrapper: RoutedSidePanelWrapper,
    });

    result.current(SettingsPath.NewAccount, undefined, undefined, {
      surface: 'main',
    });

    expect(openSettingsMenuMock).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/settings/accounts/new', {
      surface: 'main',
    });
  });
});
