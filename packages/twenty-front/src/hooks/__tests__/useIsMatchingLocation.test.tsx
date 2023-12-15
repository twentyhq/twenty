import { MemoryRouter } from 'react-router-dom';
import { renderHook } from '@testing-library/react';

import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter
    initialEntries={['/one', '/two', { pathname: '/three' }]}
    initialIndex={1}
  >
    {children}
  </MemoryRouter>
);

describe('useIsMatchingLocation', () => {
  it('should return true for a matching location', () => {
    const { result } = renderHook(
      () => {
        const checkMatchingLocation = useIsMatchingLocation();
        return checkMatchingLocation('/two');
      },
      { wrapper: Wrapper },
    );

    expect(result.current).toBe(true);
  });

  it('should return false for a non-matching location', () => {
    const { result } = renderHook(
      () => {
        const checkMatchingLocation = useIsMatchingLocation();
        return checkMatchingLocation('/four');
      },
      { wrapper: Wrapper },
    );

    expect(result.current).toBe(false);
  });
});
