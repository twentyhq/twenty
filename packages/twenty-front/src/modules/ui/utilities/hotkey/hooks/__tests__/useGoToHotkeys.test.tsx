import { act, fireEvent, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { useGoToHotkeys } from '@/ui/utilities/hotkey/hooks/useGoToHotkeys';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter
    initialEntries={['/one', '/two', { pathname: '/three' }]}
    initialIndex={1}
  >
    {children}
  </MemoryRouter>
);
const renderHookConfig = {
  wrapper: Wrapper,
};

describe('useGoToHotkeys', () => {
  it('should navigate on hotkey trigger', () => {
    const { result } = renderHook(() => {
      useGoToHotkeys({ key: 'a', location: '/three' });

      const location = useLocation();

      return {
        pathname: location.pathname,
      };
    }, renderHookConfig);

    expect(result.current.pathname).toBe('/two');

    act(() => {
      fireEvent.keyDown(document, { key: 'g', code: 'KeyG' });
    });

    act(() => {
      fireEvent.keyDown(document, { key: 'a', code: 'KeyA' });
    });

    expect(result.current.pathname).toBe('/three');
  });
  it('blocks navigation and side effects while disabled and restores them when enabled', async () => {
    const preNavigateFunction = jest.fn();
    const user = userEvent.setup();
    const { result, rerender } = renderHook(
      ({ isEnabled }) => {
        useGoToHotkeys({
          key: 's',
          location: '/three',
          isEnabled,
          preNavigateFunction,
        });

        return useLocation();
      },
      { ...renderHookConfig, initialProps: { isEnabled: false } },
    );

    await user.keyboard('gs');

    expect(result.current.pathname).toBe('/two');
    expect(preNavigateFunction).not.toHaveBeenCalled();

    rerender({ isEnabled: true });
    await user.keyboard('gs');

    expect(result.current.pathname).toBe('/three');
    expect(preNavigateFunction).toHaveBeenCalledTimes(1);
    expect(preNavigateFunction).toHaveBeenCalledWith();
  });
});
