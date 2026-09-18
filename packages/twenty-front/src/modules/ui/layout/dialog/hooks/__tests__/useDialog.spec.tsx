import { renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode, act } from 'react';

import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { isDialogOpenedComponentState } from '@/ui/layout/dialog/states/isDialogOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const dialogId = 'test-dialog-id';

const createTestWrapper = () => {
  const store = createStore();

  const TestWrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return TestWrapper;
};

describe('useDialog', () => {
  it('should open a dialog', () => {
    const { result } = renderHook(
      () => {
        const dialog = useDialog();
        const isDialogOpened = useAtomComponentStateValue(
          isDialogOpenedComponentState,
          dialogId,
        );
        return { dialog, isDialogOpened };
      },
      {
        wrapper: createTestWrapper(),
      },
    );

    act(() => {
      result.current.dialog.openDialog(dialogId);
    });

    expect(result.current.isDialogOpened).toBe(true);
  });

  it('should close a dialog', () => {
    const { result } = renderHook(
      () => {
        const dialog = useDialog();
        const isDialogOpened = useAtomComponentStateValue(
          isDialogOpenedComponentState,
          dialogId,
        );
        return { dialog, isDialogOpened };
      },
      {
        wrapper: createTestWrapper(),
      },
    );

    act(() => {
      result.current.dialog.openDialog(dialogId);
    });
    expect(result.current.isDialogOpened).toBe(true);

    act(() => {
      result.current.dialog.closeDialog(dialogId);
    });

    expect(result.current.isDialogOpened).toBe(false);
  });

  it('should toggle a dialog (open when closed)', () => {
    const { result } = renderHook(
      () => {
        const dialog = useDialog();
        const isDialogOpened = useAtomComponentStateValue(
          isDialogOpenedComponentState,
          dialogId,
        );
        return { dialog, isDialogOpened };
      },
      {
        wrapper: createTestWrapper(),
      },
    );

    expect(result.current.isDialogOpened).toBe(false);

    act(() => {
      result.current.dialog.toggleDialog(dialogId);
    });

    expect(result.current.isDialogOpened).toBe(true);
  });

  it('should toggle a dialog (close when open)', () => {
    const { result } = renderHook(
      () => {
        const dialog = useDialog();
        const isDialogOpened = useAtomComponentStateValue(
          isDialogOpenedComponentState,
          dialogId,
        );
        return { dialog, isDialogOpened };
      },
      {
        wrapper: createTestWrapper(),
      },
    );

    act(() => {
      result.current.dialog.openDialog(dialogId);
    });
    expect(result.current.isDialogOpened).toBe(true);

    act(() => {
      result.current.dialog.toggleDialog(dialogId);
    });

    expect(result.current.isDialogOpened).toBe(false);
  });
});
