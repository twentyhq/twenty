import { renderHook } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import { useOpenEmailThreadRightDrawer } from '@/activities/emails/right-drawer/hooks/useOpenEmailThreadRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';

const mockOpenRightDrawer = jest.fn();
const mockSetHotkeyScope = jest.fn();

jest.mock('@/ui/layout/right-drawer/hooks/useRightDrawer', () => ({
  useRightDrawer: () => ({
    openRightDrawer: mockOpenRightDrawer,
  }),
}));

jest.mock('@/ui/utilities/hotkey/hooks/useSetHotkeyScope', () => ({
  useSetHotkeyScope: () => mockSetHotkeyScope,
}));

test('useOpenEmailThreadRightDrawer opens the email thread right drawer', () => {
  const { result } = renderHook(() => useOpenEmailThreadRightDrawer());

  act(() => {
    result.current();
  });

  expect(mockSetHotkeyScope).toHaveBeenCalledWith(
    RightDrawerHotkeyScope.RightDrawer,
    { goto: false },
  );
  expect(mockOpenRightDrawer).toHaveBeenCalledWith(
    RightDrawerPages.ViewEmailThread,
  );
});
