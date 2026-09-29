import { isNonEmptyString, isString } from '@sniptt/guards';
import {
  isDefined,
  isPlainObject,
  parseCanonicalTipTapJsonDocument,
} from 'twenty-shared/utils';

import { type AgentChatDraft } from '@/ai/types/AgentChatDraft';

const isAgentChatDraft = (draft: unknown): draft is AgentChatDraft => {
  if (!isPlainObject(draft) || !isString(draft.serializedDocument)) {
    return false;
  }

  const { serializedDocument, pendingRecordTarget } = draft;

  const isSerializedDocumentValid =
    serializedDocument === '' ||
    isDefined(parseCanonicalTipTapJsonDocument(serializedDocument));

  const isPendingRecordTargetValid =
    !isDefined(pendingRecordTarget) ||
    (isPlainObject(pendingRecordTarget) &&
      isNonEmptyString(pendingRecordTarget.objectNameSingular) &&
      isNonEmptyString(pendingRecordTarget.recordId));

  return isSerializedDocumentValid && isPendingRecordTargetValid;
};

export const isAgentChatDraftsByThreadId = (
  value: unknown,
): value is Record<string, AgentChatDraft> =>
  isPlainObject(value) && Object.values(value).every(isAgentChatDraft);
