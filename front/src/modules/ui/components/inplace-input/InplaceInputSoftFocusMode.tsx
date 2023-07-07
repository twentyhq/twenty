import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useRecoilState } from 'recoil';

import { captureHotkeyTypeInFocusState } from '@/hotkeys/states/captureHotkeyTypeInFocusState';
import { isNonTextWritingKey } from '@/utils/hotkeys/isNonTextWritingKey';

import { useInplaceInput } from './hooks/useCloseInplaceInput';
import { InplaceInputDisplayMode } from './InplaceInputDisplayMode';

export function InplaceInputSoftFocusMode({
  children,
}: React.PropsWithChildren<unknown>) {
  const { closeInplaceInput, openInplaceInput } = useInplaceInput();
  const [captureHotkeyTypeInFocus] = useRecoilState(
    captureHotkeyTypeInFocusState,
  );

  useHotkeys(
    'enter',
    () => {
      openInplaceInput();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [closeInplaceInput],
  );

  useHotkeys(
    '*',
    (keyboardEvent) => {
      const isWritingText =
        !isNonTextWritingKey(keyboardEvent.key) &&
        !keyboardEvent.ctrlKey &&
        !keyboardEvent.metaKey;

      if (!isWritingText) {
        return;
      }

      if (captureHotkeyTypeInFocus) {
        return;
      }
      openInplaceInput();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: false,
    },
  );

  return (
    <InplaceInputDisplayMode hasSoftFocus>{children}</InplaceInputDisplayMode>
  );
}
