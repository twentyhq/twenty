import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';
import { RightDrawerHotkeyScope, RightDrawerPages } from 'twenty-ui';

import { useOpenEmailThreadRightDrawer } from '@/activities/emails/right-drawer/hooks/useOpenEmailThreadRightDrawer';

const mockOpenRightDrawer = jest.fn();
const mockSetHotkeyScope = jest.fn();

jest.mock('twenty-ui', () => ({
  useSetHotkeyScope: () => mockSetHotkeyScope,
  useRightDrawer: () => ({
    openRightDrawer: mockOpenRightDrawer,
  }),
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
