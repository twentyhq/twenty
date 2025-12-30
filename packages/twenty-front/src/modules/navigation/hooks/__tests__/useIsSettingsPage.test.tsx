import { MemoryRouter } from 'react-router-dom';
import { renderHook } from '@testing-library/react';

import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';

const getWrapper =
  (initialIndex: 0 | 1) =>
  ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter
      initialEntries={['/settings/', '/tasks']}
      initialIndex={initialIndex}
    >
      {children}
    </MemoryRouter>
  );

describe('useIsSettingsPage', () => {
  it('should return true for pages which has /settings/ in pathname', () => {
    const { result } = renderHook(() => useIsSettingsPage(), {
      wrapper: getWrapper(0),
    });
    expect(result.current).toBe(true);
  });

  it('should return false for other pages which does not have /settings/ in pathname', () => {
    const { result } = renderHook(() => useIsSettingsPage(), {
      wrapper: getWrapper(1),
    });
    expect(result.current).toBe(false);
  });
});
