import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { WelcomeAnimationAutoLeaveEffect } from '@/onboarding/components/WelcomeOverlay/WelcomeAnimationAutoLeaveEffect';
import { WELCOME_TITLE_HANDOFF_TARGET_ELEMENT_ID } from '@/onboarding/constants/WelcomeTitleHandoffTargetElementId';
import { isWelcomeAnimationLeavingState } from '@/onboarding/states/isWelcomeAnimationLeavingState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const addHandoffTarget = () => {
  const target = document.createElement('div');
  target.id = WELCOME_TITLE_HANDOFF_TARGET_ELEMENT_ID;
  document.body.appendChild(target);
};

const isLeaving = () => jotaiStore.get(isWelcomeAnimationLeavingState.atom);

describe('WelcomeAnimationAutoLeaveEffect', () => {
  beforeEach(() => {
    resetJotaiStore();
    jest.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should leave at the minimum hold once the handoff target exists', () => {
    addHandoffTarget();
    render(<WelcomeAnimationAutoLeaveEffect />, { wrapper: Wrapper });

    act(() => {
      jest.advanceTimersByTime(2899);
    });
    expect(isLeaving()).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(isLeaving()).toBe(true);
  });

  it('should hold for the minimum until the target appears', () => {
    render(<WelcomeAnimationAutoLeaveEffect />, { wrapper: Wrapper });

    act(() => {
      jest.advanceTimersByTime(2900);
    });
    expect(isLeaving()).toBe(false);
  });

  // The cap is anchored to mount and must not slide when the target arrives late.
  it('should leave at the cap when the target never appears', () => {
    render(<WelcomeAnimationAutoLeaveEffect />, { wrapper: Wrapper });

    act(() => {
      jest.advanceTimersByTime(4999);
    });
    expect(isLeaving()).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(isLeaving()).toBe(true);
  });

  it('should not fire again after the cap once it has already left', () => {
    addHandoffTarget();
    render(<WelcomeAnimationAutoLeaveEffect />, { wrapper: Wrapper });

    act(() => {
      jest.advanceTimersByTime(2900);
    });
    jotaiStore.set(isWelcomeAnimationLeavingState.atom, false);

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(isLeaving()).toBe(false);
  });
});
