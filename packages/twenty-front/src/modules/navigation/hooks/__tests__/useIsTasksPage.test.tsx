import { MemoryRouter } from 'react-router-dom';
import { renderHook } from '@testing-library/react';

import { useIsTasksPage } from '../useIsTasksPage';

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
  it('should return true for pages which has /tasks in pathname', () => {
    const { result } = renderHook(() => useIsTasksPage(), {
      wrapper: getWrapper(1),
    });
    expect(result.current).toBe(true);
  });

  it('should return false for other pages which does not have /tasks in pathname', () => {
    const { result } = renderHook(() => useIsTasksPage(), {
      wrapper: getWrapper(0),
    });
    expect(result.current).toBe(false);
  });
});
