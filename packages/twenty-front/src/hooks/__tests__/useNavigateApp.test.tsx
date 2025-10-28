import { renderHook } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { AppPath } from 'twenty-shared/types';
import { useNavigateApp } from '~/hooks/useNavigateApp';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('useNavigateApp', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('should navigate to the correct path without params', () => {
    const { result } = renderHook(() => useNavigateApp(), {
      wrapper: Wrapper,
    });

    result.current(AppPath.Index);

    expect(mockNavigate).toHaveBeenCalledWith('/', undefined);
  });

  it('should navigate to the correct path with params', () => {
    const { result } = renderHook(() => useNavigateApp(), {
      wrapper: Wrapper,
    });

    result.current(AppPath.RecordShowPage, {
      objectNameSingular: CoreObjectNameSingular.Company,
      objectRecordId: '123',
    });

    expect(mockNavigate).toHaveBeenCalledWith('/object/company/123', undefined);
  });

  it('should navigate with query params', () => {
    const { result } = renderHook(() => useNavigateApp(), {
      wrapper: Wrapper,
    });

    const queryParams = { viewId: '123', filter: 'test' };
    result.current(AppPath.Index, undefined, queryParams);

    expect(mockNavigate).toHaveBeenCalledWith(
      '/?viewId=123&filter=test',
      undefined,
    );
  });

  it('should navigate with options', () => {
    const { result } = renderHook(() => useNavigateApp(), {
      wrapper: Wrapper,
    });

    const options = { replace: true, state: { test: true } };
    result.current(AppPath.Index, undefined, undefined, options);

    expect(mockNavigate).toHaveBeenCalledWith('/', options);
  });
});
