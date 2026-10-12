import { useStore } from 'jotai';
import {
  type ExtendedUIMessage,
  getFillOpenFormToolResult,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { aiChatOpenFormState } from '@/ai/states/aiChatOpenFormState';
import { appliedAiChatOpenFormFillIdsState } from '@/ai/states/appliedAiChatOpenFormFillIdsState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';

export const useApplyAiChatOpenFormFills = () => {
  const store = useStore();

  const applyAiChatOpenFormFills = ({
    message,
    turnSenderUserWorkspaceId,
  }: {
    message: Pick<ExtendedUIMessage, 'parts'>;
    turnSenderUserWorkspaceId: string | null | undefined;
  }) => {
    const appliedFillIds = store.get(appliedAiChatOpenFormFillIdsState.atom);
    const newFills = message.parts
      .map(getFillOpenFormToolResult)
      .filter(isDefined)
      .filter((fill) => !appliedFillIds.includes(fill.toolCallId));

    if (newFills.length === 0) {
      return;
    }

    store.set(appliedAiChatOpenFormFillIdsState.atom, [
      ...appliedFillIds,
      ...newFills.map((fill) => fill.toolCallId),
    ]);

    const currentWorkspaceMember = store.get(currentWorkspaceMemberState.atom);

    if (turnSenderUserWorkspaceId !== currentWorkspaceMember?.userWorkspaceId) {
      return;
    }

    const aiChatOpenForm = store.get(aiChatOpenFormState.atom);
    const fillsForOpenForm = newFills.filter(
      (fill) => fill.formId === aiChatOpenForm?.formId,
    );

    if (!isDefined(aiChatOpenForm) || fillsForOpenForm.length === 0) {
      return;
    }

    aiChatOpenForm.onFill(
      Object.assign({}, ...fillsForOpenForm.map((fill) => fill.values)),
    );
  };

  return { applyAiChatOpenFormFills };
};
