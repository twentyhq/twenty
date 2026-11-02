import { act, fireEvent, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { PageFocusId } from '@/types/PageFocusId';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
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

  it('navigates from a settings page but leaves typing in a field alone', async () => {
    const store = createStore();
    store.set(focusStackState.atom, [
      {
        focusId: PageFocusId.Settings,
        componentInstance: {
          componentType: FocusComponentType.PAGE,
          componentInstanceId: PageFocusId.Settings,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysWithModifiers: false,
          enableGlobalHotkeysConflictingWithKeyboard: false,
        },
      },
    ]);
    const user = userEvent.setup();
    const field = document.body.appendChild(document.createElement('input'));
    const { result } = renderHook(
      () => {
        useGoToHotkeys({ key: 's', location: '/three' });

        return useLocation();
      },
      {
        wrapper: ({ children }) => (
          <JotaiProvider store={store}>
            <Wrapper>{children}</Wrapper>
          </JotaiProvider>
        ),
      },
    );

    await user.click(field);
    await user.keyboard('gs');

    expect(field).toHaveValue('gs');
    expect(result.current.pathname).toBe('/two');

    field.blur();
    await user.keyboard('gs');

    expect(result.current.pathname).toBe('/three');

    field.remove();
  });
});
