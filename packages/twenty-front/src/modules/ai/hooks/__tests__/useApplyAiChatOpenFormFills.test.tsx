import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { useApplyAiChatOpenFormFills } from '@/ai/hooks/useApplyAiChatOpenFormFills';
import { aiChatOpenFormState } from '@/ai/states/aiChatOpenFormState';
import {
  type CurrentWorkspaceMember,
  currentWorkspaceMemberState,
} from '@/auth/states/currentWorkspaceMemberState';

const CURRENT_USER_WORKSPACE_ID = 'user-workspace-me';

const buildFillMessage = (formId: string) => ({
  parts: [
    {
      type: 'tool-fill_open_form',
      toolCallId: `call-${formId}`,
      state: 'output-available',
      input: { values: { name: 'Domain required' } },
      output: {
        success: true,
        message: 'Filled',
        result: { formId, values: { name: 'Domain required' } },
      },
    } as unknown as ExtendedUIMessagePart,
  ],
});

const renderApplyHook = () => {
  const store = createStore();
  const onFill = jest.fn();

  store.set(currentWorkspaceMemberState.atom, {
    userWorkspaceId: CURRENT_USER_WORKSPACE_ID,
  } as CurrentWorkspaceMember);
  store.set(aiChatOpenFormState.atom, {
    formId: 'form-1',
    description: 'Validation rule on the Company object',
    fields: [{ name: 'name', description: 'Short rule name' }],
    onFill,
  });

  const { result } = renderHook(() => useApplyAiChatOpenFormFills(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>{children}</JotaiProvider>
    ),
  });

  return {
    onFill,
    applyAiChatOpenFormFills: result.current.applyAiChatOpenFormFills,
  };
};

describe('useApplyAiChatOpenFormFills', () => {
  it('fills the open form once', () => {
    const { onFill, applyAiChatOpenFormFills } = renderApplyHook();

    applyAiChatOpenFormFills({
      message: buildFillMessage('form-1'),
      turnSenderUserWorkspaceId: CURRENT_USER_WORKSPACE_ID,
    });
    applyAiChatOpenFormFills({
      message: buildFillMessage('form-1'),
      turnSenderUserWorkspaceId: CURRENT_USER_WORKSPACE_ID,
    });

    expect(onFill).toHaveBeenCalledTimes(1);
    expect(onFill).toHaveBeenCalledWith({ name: 'Domain required' });
  });

  it('leaves the open form alone for another form or another member', () => {
    const { onFill, applyAiChatOpenFormFills } = renderApplyHook();

    applyAiChatOpenFormFills({
      message: buildFillMessage('form-2'),
      turnSenderUserWorkspaceId: CURRENT_USER_WORKSPACE_ID,
    });
    applyAiChatOpenFormFills({
      message: buildFillMessage('form-1'),
      turnSenderUserWorkspaceId: 'user-workspace-teammate',
    });

    expect(onFill).not.toHaveBeenCalled();
  });
});
