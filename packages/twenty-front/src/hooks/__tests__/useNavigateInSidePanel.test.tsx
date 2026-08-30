import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { type ReactNode } from 'react';
import { AppPath, SettingsPath } from 'twenty-shared/types';

import { SidePanelRoutedSurfaceContext } from '@/side-panel/routing/contexts/SidePanelRoutedSurfaceContext';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const navigateMock = jest.fn();
const openSettingsMenuMock = jest.fn();
const navigateFromSidePanelMock = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigateMock,
}));

jest.mock('@/navigation/hooks/useOpenSettings', () => ({
  useOpenSettingsMenu: () => ({ openSettingsMenu: openSettingsMenuMock }),
}));

const renderInSurface = <TResult,>(
  useHook: () => TResult,
  { isInSidePanel }: { isInSidePanel: boolean },
) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      {isInSidePanel ? (
        <SidePanelRoutedSurfaceContext.Provider
          value={{ navigateFromSidePanel: navigateFromSidePanelMock }}
        >
          {children}
        </SidePanelRoutedSurfaceContext.Provider>
      ) : (
        children
      )}
    </MemoryRouter>
  );

  return renderHook(useHook, { wrapper });
};

describe('navigating from inside the side panel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should keep a hostable settings target on the panel', () => {
    const { result } = renderInSurface(useNavigateSettings, {
      isInSidePanel: true,
    });

    act(() => {
      result.current(SettingsPath.ObjectDetail, {
        objectNamePlural: 'companies',
      });
    });

    expect(navigateFromSidePanelMock).toHaveBeenCalledWith(
      '/settings/objects/companies',
    );
    expect(navigateMock).not.toHaveBeenCalled();
    expect(openSettingsMenuMock).not.toHaveBeenCalled();
  });

  it('should send a settings target the panel cannot host to the main outlet', () => {
    const { result } = renderInSurface(useNavigateSettings, {
      isInSidePanel: true,
    });

    act(() => {
      result.current(SettingsPath.Billing);
    });

    expect(navigateFromSidePanelMock).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/settings/billing', undefined);
    expect(openSettingsMenuMock).toHaveBeenCalled();
  });

  it('should keep a hostable app target on the panel', () => {
    const { result } = renderInSurface(useNavigateApp, {
      isInSidePanel: true,
    });

    act(() => {
      result.current(AppPath.RecordIndexPage, {
        objectNamePlural: 'companies',
      });
    });

    expect(navigateFromSidePanelMock).toHaveBeenCalledWith(
      '/objects/companies',
    );
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('should keep a record target on the panel', () => {
    const { result } = renderInSurface(useNavigateApp, {
      isInSidePanel: true,
    });

    act(() => {
      result.current(AppPath.RecordShowPage, {
        objectNameSingular: 'company',
        objectRecordId: 'record-1',
      });
    });

    expect(navigateFromSidePanelMock).toHaveBeenCalledWith(
      '/object/company/record-1',
    );
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('should send an app target the panel cannot host to the main outlet', () => {
    const { result } = renderInSurface(useNavigateApp, {
      isInSidePanel: true,
    });

    act(() => {
      result.current(AppPath.PageLayoutPage, {
        pageLayoutId: 'page-layout-1',
      });
    });

    expect(navigateFromSidePanelMock).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/page/page-layout-1', undefined);
  });

  it('should navigate the main outlet outside the panel', () => {
    const { result } = renderInSurface(useNavigateSettings, {
      isInSidePanel: false,
    });

    act(() => {
      result.current(SettingsPath.ObjectDetail, {
        objectNamePlural: 'companies',
      });
    });

    expect(navigateFromSidePanelMock).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith(
      '/settings/objects/companies',
      undefined,
    );
  });
});
