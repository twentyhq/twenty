import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';

import {
  type AppNavigator,
  AppNavigatorContext,
} from '@/app/contexts/AppNavigatorContext';
import { CoreObjectNameSingular, AppPath } from 'twenty-shared/types';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const mockAppNavigator: AppNavigator = {
  push: jest.fn(),
  replace: jest.fn(),
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <AppNavigatorContext.Provider value={mockAppNavigator}>
    {children}
  </AppNavigatorContext.Provider>
);

describe('useNavigateApp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should navigate to the correct path without params', () => {
    const { result } = renderHook(() => useNavigateApp(), {
      wrapper: Wrapper,
    });

    result.current(AppPath.Index);

    expect(mockAppNavigator.push).toHaveBeenCalledWith(
      '/',
      undefined,
      undefined,
    );
  });

  it('should navigate to the correct path with params', () => {
    const { result } = renderHook(() => useNavigateApp(), {
      wrapper: Wrapper,
    });

    result.current(AppPath.RecordShowPage, {
      objectNameSingular: CoreObjectNameSingular.Company,
      objectRecordId: '123',
    });

    expect(mockAppNavigator.push).toHaveBeenCalledWith(
      '/object/company/123',
      undefined,
      undefined,
    );
  });

  it('should navigate with query params', () => {
    const { result } = renderHook(() => useNavigateApp(), {
      wrapper: Wrapper,
    });

    result.current(AppPath.Index, undefined, { viewId: '123', filter: 'test' });

    expect(mockAppNavigator.push).toHaveBeenCalledWith(
      '/?viewId=123&filter=test',
      undefined,
      undefined,
    );
  });

  it('should replace with state and pass the options to the navigator', () => {
    const { result } = renderHook(() => useNavigateApp(), {
      wrapper: Wrapper,
    });

    const options = {
      replace: true,
      state: { test: true },
      surface: 'main' as const,
    };

    result.current(AppPath.Index, undefined, undefined, options);

    expect(mockAppNavigator.replace).toHaveBeenCalledWith(
      '/',
      { test: true },
      options,
    );
    expect(mockAppNavigator.push).not.toHaveBeenCalled();
  });

  it('should not re-render its caller when the location changes', () => {
    let renderCount = 0;
    let currentPathname = '';
    let navigate: ReturnType<typeof useNavigate> | undefined;

    const LocationEffect = () => {
      currentPathname = useLocation().pathname;
      navigate = useNavigate();

      return null;
    };

    renderHook(
      () => {
        renderCount++;

        return useNavigateApp();
      },
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MemoryRouter>
            <LocationEffect />
            <Wrapper>{children}</Wrapper>
          </MemoryRouter>
        ),
      },
    );

    const renderCountBeforeNavigation = renderCount;

    act(() => {
      navigate?.('/object/company/123');
    });

    expect(currentPathname).toBe('/object/company/123');
    expect(renderCount).toBe(renderCountBeforeNavigation);
  });
});
