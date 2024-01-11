import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { useDialogManagerScopedStates } from '@/ui/feedback/dialog-manager/hooks/internal/useDialogManagerScopedStates';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';
import { DialogManagerScope } from '@/ui/feedback/dialog-manager/scopes/DialogManagerScope';
import { DialogOptions } from '@/ui/feedback/dialog-manager/types/DialogOptions';

const mockedUuid = 'mocked-uuid';
jest.mock('uuid');

(uuidv4 as jest.Mock).mockReturnValue(mockedUuid);

const dialogManagerScopeId = 'dialog-manager';
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <DialogManagerScope dialogManagerScopeId={dialogManagerScopeId}>
      {children}
    </DialogManagerScope>
  </RecoilRoot>
);

const renderHookConfig = {
  wrapper: Wrapper,
};

const mockOnclick = jest.fn();

type DialogOptionsArray = Array<Omit<DialogOptions, 'id'>>;

const dialogOptionsArray: DialogOptionsArray = [
  {
    title: 'test for title 1',
    message: 'this is a test for message 1?',
    buttons: [
      { title: 'Dont do this' },
      {
        title: 'Are you sure?',
        onClick: mockOnclick,
        variant: 'primary',
        role: 'confirm',
      },
    ],
  },
  {
    title: 'test for title 2',
    message: 'this is a test for message 2?',
    buttons: [
      { title: 'Dont do this' },
      {
        title: 'Are you sure?',
        onClick: mockOnclick,
        variant: 'primary',
        role: 'confirm',
      },
    ],
  },
  {
    title: 'test for title 3',
    message: 'this is a test for message 3?',
    buttons: [
      { title: 'Dont do this' },
      {
        title: 'Are you sure?',
        onClick: mockOnclick,
        variant: 'primary',
        role: 'confirm',
      },
    ],
  },
];

const renderHooks = () => {
  const { result } = renderHook(
    () => ({
      dialogManager: useDialogManager({
        dialogManagerScopeId: dialogManagerScopeId,
      }),
      internalState: useDialogManagerScopedStates({
        dialogManagerScopeId,
      }),
    }),
    renderHookConfig,
  );

  return result;
};

const expectedReturnFromEnqueue = (
  options: Array<Omit<DialogOptions, 'id'>>,
) => {
  return options.map((option) => ({
    id: 'mocked-uuid',
    ...option,
  }));
};

describe('useDialogManager', () => {
  describe('tests for useDialogManager - enqueueDialog', () => {
    it('Should enqueueDialog', () => {
      const result = renderHooks();

      const expectReturn = expectedReturnFromEnqueue([dialogOptionsArray[0]]);

      act(() => {
        result.current.dialogManager.enqueueDialog(dialogOptionsArray[0]);
      });

      const { dialogInternal } = result.current.internalState;

      expect(dialogInternal.maxQueue).toEqual(2);
      expect(dialogInternal.queue).toHaveLength(1);
      expect(dialogInternal.queue).toEqual(expectReturn);
    });

    it('Should enqueueDialog with 2 options', () => {
      const result = renderHooks();

      const expectReturn = expectedReturnFromEnqueue([
        dialogOptionsArray[0],
        dialogOptionsArray[1],
      ]);

      act(() => {
        result.current.dialogManager.enqueueDialog(dialogOptionsArray[0]);
        result.current.dialogManager.enqueueDialog(dialogOptionsArray[1]);
      });

      const { dialogInternal } = result.current.internalState;

      expect(dialogInternal.maxQueue).toEqual(2);
      expect(dialogInternal.queue).toHaveLength(2);
      expect(dialogInternal.queue).toEqual(expectReturn);
    });

    it('Should enqueueDialog with 3 options and drop the first option from the queue.', () => {
      const result = renderHooks();

      const expectReturn = expectedReturnFromEnqueue([
        dialogOptionsArray[1],
        dialogOptionsArray[2],
      ]);

      act(() => {
        result.current.dialogManager.enqueueDialog(dialogOptionsArray[0]);
        result.current.dialogManager.enqueueDialog(dialogOptionsArray[1]);
        result.current.dialogManager.enqueueDialog(dialogOptionsArray[2]);
      });

      const { dialogInternal } = result.current.internalState;

      expect(dialogInternal.maxQueue).toEqual(2);
      expect(dialogInternal.queue).toHaveLength(2);
      expect(dialogInternal.queue).toEqual(expectReturn);
    });
  });

  describe('tests for useDialogManager - closeDialog', () => {
    it('Should reset the dialog state when the closeDialog function is called with the provided id', async () => {
      const result = renderHooks();

      act(() => {
        result.current.dialogManager.enqueueDialog(dialogOptionsArray[0]);
        result.current.dialogManager.enqueueDialog(dialogOptionsArray[1]);
      });

      const expectReturnWhenEnqueue = expectedReturnFromEnqueue([
        dialogOptionsArray[0],
        dialogOptionsArray[1],
      ]);

      const { dialogInternal: stateAfterEnqueue } =
        result.current.internalState;

      expect(stateAfterEnqueue.maxQueue).toEqual(2);
      expect(stateAfterEnqueue.queue).toHaveLength(2);
      expect(stateAfterEnqueue.queue).toEqual(expectReturnWhenEnqueue);

      act(() => {
        result.current.dialogManager.closeDialog('mocked-uuid');
      });

      const expectReturnWhenClose = {
        maxQueue: 2,
        queue: [],
      };

      const { dialogInternal: stateAfterClose } = result.current.internalState;

      expect(stateAfterClose).toEqual(expectReturnWhenClose);
      expect(stateAfterClose.maxQueue).toEqual(2);
      expect(stateAfterClose.queue).toHaveLength(0);
    });
  });
});
