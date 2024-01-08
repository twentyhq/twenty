import { act } from 'react-dom/test-utils';
import { fireEvent, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';

const hotKeyCallback = jest.fn();

describe('useScopedHotkeys', () => {
  it('should work as expected', () => {
    renderHook(
      () => {
        useScopedHotkeys('ctrl+k', hotKeyCallback, AppHotkeyScope.App);

        const setHotkeyScope = useSetHotkeyScope();

        setHotkeyScope(AppHotkeyScope.App);
      },
      {
        wrapper: RecoilRoot,
      },
    );

    act(() => {
      fireEvent.keyDown(document, { key: 'k', code: 'KeyK', ctrlKey: true });
    });

    expect(hotKeyCallback).toHaveBeenCalled();
  });
});
