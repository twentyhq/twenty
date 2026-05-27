import { act, fireEvent, renderHook } from '@testing-library/react';
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

  it('should not navigate when keys are pressed while an input is focused', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const { result } = renderHook(() => {
      useGoToHotkeys({ key: 'a', location: '/three' });

      const location = useLocation();

      return {
        pathname: location.pathname,
      };
    }, renderHookConfig);

    expect(result.current.pathname).toBe('/two');

    act(() => {
      fireEvent.keyDown(input, { key: 'g', code: 'KeyG' });
    });

    act(() => {
      fireEvent.keyDown(input, { key: 'a', code: 'KeyA' });
    });

    // Navigation should NOT have happened because focus was inside an input
    expect(result.current.pathname).toBe('/two');

    document.body.removeChild(input);
  });

  it('should not navigate when keys are pressed while a textarea is focused', () => {
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();

    const { result } = renderHook(() => {
      useGoToHotkeys({ key: 'n', location: '/notes' });

      const location = useLocation();

      return {
        pathname: location.pathname,
      };
    }, renderHookConfig);

    expect(result.current.pathname).toBe('/two');

    act(() => {
      fireEvent.keyDown(textarea, { key: 'g', code: 'KeyG' });
    });

    act(() => {
      fireEvent.keyDown(textarea, { key: 'n', code: 'KeyN' });
    });

    // Navigation should NOT have happened because focus was inside a textarea
    expect(result.current.pathname).toBe('/two');

    document.body.removeChild(textarea);
  });
});
