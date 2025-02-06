import { renderHook } from '@testing-library/react';
import { useIsMatchingLocation } from '../useIsMatchingLocation';
import { MemoryRouter } from 'react-router-dom';
import { AppBasePath } from '@/types/AppBasePath';

const Wrapper =
  (initialIndex = 0) =>
  ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter
      initialEntries={['/example', '/other', `${AppBasePath.Settings}/example`]}
      initialIndex={initialIndex}
    >
      {children}
    </MemoryRouter>
  );

describe('useIsMatchingLocation', () => {
  it('returns true when paths match with no basePath', () => {
    const { result } = renderHook(() => useIsMatchingLocation(), {
      wrapper: Wrapper(),
    });

    expect(result.current('/example')).toBe(true);
  });

  it('returns false when paths do not match with no basePath', () => {
    const { result } = renderHook(() => useIsMatchingLocation(), {
      wrapper: Wrapper(),
    });

    expect(result.current('/non-match')).toBe(false);
  });

  it('returns true when paths match with basePath', () => {
    const { result } = renderHook(() => useIsMatchingLocation(), {
      wrapper: Wrapper(2),
    });

    expect(result.current('example', AppBasePath.Settings)).toBe(true);
  });

  it('returns false when paths do not match with basePath', () => {
    const { result } = renderHook(() => useIsMatchingLocation(), {
      wrapper: Wrapper(),
    });

    expect(result.current('non-match', AppBasePath.Settings)).toBe(false);
  });

  it('handles trailing slashes in basePath correctly', () => {
    const { result } = renderHook(() => useIsMatchingLocation(), {
      wrapper: Wrapper(2),
    });

    expect(
      result.current('example', (AppBasePath.Settings + '/') as AppBasePath),
    ).toBe(true);
  });

  it('handles without basePath correctly', () => {
    const { result } = renderHook(() => useIsMatchingLocation(), {
      wrapper: Wrapper(),
    });

    expect(result.current('example')).toBe(true);
  });
});
