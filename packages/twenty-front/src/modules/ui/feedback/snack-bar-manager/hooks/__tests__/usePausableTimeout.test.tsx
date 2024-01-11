import { act, renderHook } from '@testing-library/react';

import { usePausableTimeout } from '@/ui/feedback/snack-bar-manager/hooks/usePausableTimeout';

jest.useFakeTimers();

describe('usePausableTimeout', () => {
  it('should pause and resume timeout', () => {
    let callbackExecuted = false;
    const callback = () => {
      callbackExecuted = true;
    };

    const { result } = renderHook(() => usePausableTimeout(callback, 1000));

    // timetravel 500ms into the future
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callbackExecuted).toBe(false);

    act(() => {
      result.current.pauseTimeout();
    });

    // timetravel another 500ms into the future
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // The callback should not have been executed while paused
    expect(callbackExecuted).toBe(false);

    act(() => {
      result.current.resumeTimeout();
    });

    // advance all timers controlled by Jest to their final state
    act(() => {
      jest.runAllTimers();
    });

    // The callback should now have been executed
    expect(callbackExecuted).toBe(true);
  });
});
