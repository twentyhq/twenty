import { useMutation } from '@apollo/client/react';

import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useToast } from 'twenty-ui/primitives/feedback';
import {
  AgentChatThreadStatus,
  AssignChatThreadDocument,
  SetChatThreadStatusDocument,
} from '~/generated-metadata/graphql';

export const useChatThreadInboxActions = () => {
  const { applyAgentChatThreadUpdate } = useApplyAgentChatThreadUpdate();
  const { enqueueToast } = useToast();

  const [setStatusMutation] = useMutation(SetChatThreadStatusDocument);
  const [assignMutation] = useMutation(AssignChatThreadDocument);

  const setChatThreadStatus = async (
    id: string,
    status: AgentChatThreadStatus,
    snoozedUntil: Date | null = null,
  ) => {
    try {
      const { data } = await setStatusMutation({
        variables: {
          id,
          status,
          snoozedUntil: snoozedUntil?.toISOString() ?? null,
        },
      });

      if (data?.setChatThreadStatus) {
        applyAgentChatThreadUpdate({
          id: data.setChatThreadStatus.id,
          status: data.setChatThreadStatus.status,
          snoozedUntil: data.setChatThreadStatus.snoozedUntil ?? null,
          updatedAt: data.setChatThreadStatus.updatedAt,
        });
      }
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  const markChatThreadDone = (id: string) =>
    setChatThreadStatus(id, AgentChatThreadStatus.DONE);

  const reopenChatThread = (id: string) =>
    setChatThreadStatus(id, AgentChatThreadStatus.OPEN);

  const snoozeChatThread = (id: string, snoozedUntil: Date) =>
    setChatThreadStatus(id, AgentChatThreadStatus.SNOOZED, snoozedUntil);

  const assignChatThread = async (
    id: string,
    assigneeUserWorkspaceId: string | null,
  ) => {
    try {
      const { data } = await assignMutation({
        variables: { id, assigneeUserWorkspaceId },
      });

      if (data?.assignChatThread) {
        applyAgentChatThreadUpdate({
          id: data.assignChatThread.id,
          assigneeUserWorkspaceId:
            data.assignChatThread.assigneeUserWorkspaceId ?? null,
          updatedAt: data.assignChatThread.updatedAt,
        });
      }
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return {
    markChatThreadDone,
    reopenChatThread,
    snoozeChatThread,
    assignChatThread,
  };
};
