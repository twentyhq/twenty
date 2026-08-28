import { act, renderHook } from '@testing-library/react';

import { usePromiseTransition } from '@/ui/utilities/react-transition/hooks/usePromiseTransition';

describe('usePromiseTransition', () => {
  it('resolves with the callback result', async () => {
    const { result } = renderHook(() => usePromiseTransition());

    const value = await act(() =>
      result.current.startPromiseTransition(async () => 'transition-result'),
    );

    expect(value).toBe('transition-result');
    expect(result.current.isPending).toBe(false);
  });

  it('rejects when the callback throws', async () => {
    const { result } = renderHook(() => usePromiseTransition());

    await act(async () => {
      await expect(
        result.current.startPromiseTransition(async () => {
          throw new Error('transition-error');
        }),
      ).rejects.toThrow('transition-error');
    });
  });
});
