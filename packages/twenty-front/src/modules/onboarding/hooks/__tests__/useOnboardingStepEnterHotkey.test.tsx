import { renderHook } from '@testing-library/react';

import { useOnboardingStepEnterHotkey } from '@/onboarding/hooks/useOnboardingStepEnterHotkey';
import { PageFocusId } from '@/types/PageFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { Key } from 'ts-key-enum';

jest.mock('@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement');

describe('useOnboardingStepEnterHotkey', () => {
  const mockUseHotkeysOnFocusedElement = jest.mocked(
    useHotkeysOnFocusedElement,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers Enter hotkey with preventDefault set to false', () => {
    const onEnter = jest.fn();

    renderHook(() =>
      useOnboardingStepEnterHotkey({
        focusId: PageFocusId.CreateProfile,
        onEnter,
      }),
    );

    expect(mockUseHotkeysOnFocusedElement).toHaveBeenCalledWith(
      expect.objectContaining({
        keys: Key.Enter,
        focusId: PageFocusId.CreateProfile,
        dependencies: [onEnter],
        options: { preventDefault: false },
      }),
    );
  });

  it('calls onEnter when Enter is pressed on a non-button element (e.g. text input)', () => {
    const onEnter = jest.fn();

    renderHook(() =>
      useOnboardingStepEnterHotkey({
        focusId: PageFocusId.CreateProfile,
        onEnter,
      }),
    );

    const registeredCallback =
      mockUseHotkeysOnFocusedElement.mock.calls[0][0].callback;

    const inputElement = document.createElement('input');
    const mockKeyboardEvent = {
      target: inputElement,
    } as unknown as KeyboardEvent;

    registeredCallback(mockKeyboardEvent, {} as any);

    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it('does not call onEnter when Enter is pressed on an HTMLButtonElement to preserve native button activation', () => {
    const onEnter = jest.fn();

    renderHook(() =>
      useOnboardingStepEnterHotkey({
        focusId: PageFocusId.CreateProfile,
        onEnter,
      }),
    );

    const registeredCallback =
      mockUseHotkeysOnFocusedElement.mock.calls[0][0].callback;

    const buttonElement = document.createElement('button');
    const mockKeyboardEvent = {
      target: buttonElement,
    } as unknown as KeyboardEvent;

    registeredCallback(mockKeyboardEvent, {} as any);

    expect(onEnter).not.toHaveBeenCalled();
  });
});
