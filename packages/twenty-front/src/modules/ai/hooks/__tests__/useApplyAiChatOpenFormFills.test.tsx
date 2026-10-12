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

const buildFillPart = (
  formId: string,
  values: Record<string, string> = { name: 'Domain required' },
  toolCallId = `call-${formId}`,
) =>
  ({
    type: 'tool-fill_open_form',
    toolCallId,
    state: 'output-available',
    input: { values },
    output: { success: true, message: 'Sent', result: { formId, values } },
  }) as unknown as ExtendedUIMessagePart;

const buildFillMessage = (formId: string) => ({
  parts: [buildFillPart(formId)],
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

  it('fills the open form once with every fill of the same pass', () => {
    const { onFill, applyAiChatOpenFormFills } = renderApplyHook();

    applyAiChatOpenFormFills({
      message: {
        parts: [
          buildFillPart('form-1', { name: 'Domain required' }, 'call-1'),
          buildFillPart(
            'form-1',
            { expression: 'not isEmpty(domainName)' },
            'call-2',
          ),
        ],
      },
      turnSenderUserWorkspaceId: CURRENT_USER_WORKSPACE_ID,
    });

    expect(onFill).toHaveBeenCalledTimes(1);
    expect(onFill).toHaveBeenCalledWith({
      name: 'Domain required',
      expression: 'not isEmpty(domainName)',
    });
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
