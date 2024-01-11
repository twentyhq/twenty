import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useDialogManagerScopedStates } from '@/ui/feedback/dialog-manager/hooks/internal/useDialogManagerScopedStates';
import { DialogManagerScope } from '@/ui/feedback/dialog-manager/scopes/DialogManagerScope';

const dialogManagerScopeId = 'dialog-manager';

const defaultReturnDialogState = { maxQueue: 2, queue: [] };

const updatedReturnDialogState = {
  maxQueue: 5,
  queue: [{ id: 'fakeId', title: 'testTitle', message: 'testMessage' }],
};

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <RecoilRoot>
      <DialogManagerScope dialogManagerScopeId={dialogManagerScopeId}>
        {children}
      </DialogManagerScope>
    </RecoilRoot>
  );
};

describe('useDialogManagerScopedStates', () => {
  it('Should return a dialog state and a function to update the state', async () => {
    const { result } = renderHook(
      () =>
        useDialogManagerScopedStates({
          dialogManagerScopeId,
        }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.dialogInternal).toEqual(defaultReturnDialogState);
    expect(result.current.setDialogInternal).toBeInstanceOf(Function);

    await act(async () => {
      result.current.setDialogInternal(updatedReturnDialogState);
    });

    expect(result.current.dialogInternal).toEqual(updatedReturnDialogState);
  });
});
