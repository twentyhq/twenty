import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { useLogsSwitchTypingSequence } from '@/navigation/hooks/useLogsSwitchTypingSequence';

jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  useReducedMotion: () => false,
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const renderTypingSequence = () =>
  renderHook(
    ({ isEnabled }: { isEnabled: boolean }) =>
      useLogsSwitchTypingSequence(isEnabled),
    { initialProps: { isEnabled: false }, wrapper: Wrapper },
  );

describe('useLogsSwitchTypingSequence', () => {
  it('keeps the animation started by the switch when logs turns on', () => {
    const { result, rerender } = renderTypingSequence();

    act(() => result.current.playEnterSequence());
    rerender({ isEnabled: true });

    expect(result.current.isTyping).toBe(true);
  });

  it('drops an animation interrupted by turning logs off elsewhere', () => {
    const { result, rerender } = renderTypingSequence();

    act(() => result.current.playEnterSequence());
    rerender({ isEnabled: true });
    rerender({ isEnabled: false });

    expect(result.current.sequence).toBeNull();
    expect(result.current.displayedFrame).toBeNull();

    rerender({ isEnabled: true });

    expect(result.current.isTyping).toBe(false);
    expect(result.current.displayedFrame?.text).toBe('Logs');
  });
});
