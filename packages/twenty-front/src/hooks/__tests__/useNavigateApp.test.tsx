import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import {
  MemoryRouter,
  type Navigator,
  UNSAFE_NavigationContext,
  useLocation,
} from 'react-router-dom';

import { CoreObjectNameSingular, AppPath } from 'twenty-shared/types';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const mockNavigator = {
  push: jest.fn(),
  replace: jest.fn(),
} as unknown as Navigator;

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <UNSAFE_NavigationContext.Provider
      value={{
        basename: '/',
        navigator: mockNavigator,
        static: false,
        useTransitions: false,
        future: {},
      }}
    >
      {children}
    </UNSAFE_NavigationContext.Provider>
  </MemoryRouter>
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

    expect(mockNavigator.push).toHaveBeenCalledWith('/', undefined, undefined);
  });

  it('should navigate to the correct path with params', () => {
    const { result } = renderHook(() => useNavigateApp(), {
      wrapper: Wrapper,
    });

    result.current(AppPath.RecordShowPage, {
      objectNameSingular: CoreObjectNameSingular.Company,
      objectRecordId: '123',
    });

    expect(mockNavigator.push).toHaveBeenCalledWith(
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

    expect(mockNavigator.push).toHaveBeenCalledWith(
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

    expect(mockNavigator.replace).toHaveBeenCalledWith(
      '/',
      { test: true },
      options,
    );
    expect(mockNavigator.push).not.toHaveBeenCalled();
  });

  it('should not re-render its caller when the location changes', () => {
    let renderCount = 0;
    let currentPathname = '';

    const LocationSpyEffect = () => {
      currentPathname = useLocation().pathname;

      return null;
    };

    const { result } = renderHook(
      () => {
        renderCount++;

        return useNavigateApp();
      },
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MemoryRouter>
            <LocationSpyEffect />
            {children}
          </MemoryRouter>
        ),
      },
    );

    const renderCountBeforeNavigation = renderCount;

    act(() => {
      result.current(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.Company,
        objectRecordId: '123',
      });
    });

    expect(currentPathname).toBe('/object/company/123');
    expect(renderCount).toBe(renderCountBeforeNavigation);
  });
});
