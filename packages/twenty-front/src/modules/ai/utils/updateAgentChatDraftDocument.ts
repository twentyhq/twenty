import { isDefined } from 'twenty-shared/utils';

import { type AgentChatDraft } from '@/ai/types/AgentChatDraft';
import { isRecordMentionedInSerializedDocument } from '@/mention/utils/isRecordMentionedInSerializedDocument';

export const updateAgentChatDraftDocument = ({
  draft,
  serializedDocument,
}: {
  draft: AgentChatDraft | undefined;
  serializedDocument: string;
}): AgentChatDraft => {
  const pendingRecordTarget = draft?.pendingRecordTarget;

  if (!isDefined(pendingRecordTarget)) {
    return { serializedDocument };
  }

  // Deleting the record's mention takes the chat off that record. A draft
  // that never mentioned it, like the one kept to retry a failed attach,
  // keeps it.
  const isPendingRecordMentionRemoved =
    isRecordMentionedInSerializedDocument({
      serializedDocument: draft?.serializedDocument ?? '',
      recordId: pendingRecordTarget.recordId,
    }) &&
    !isRecordMentionedInSerializedDocument({
      serializedDocument,
      recordId: pendingRecordTarget.recordId,
    });

  return isPendingRecordMentionRemoved
    ? { serializedDocument }
    : { serializedDocument, pendingRecordTarget };
};
