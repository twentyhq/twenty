import { isString } from '@sniptt/guards';

import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { type AiChatThreadUpdate } from '@/ai-chat/threads/types/AiChatThreadUpdate';
import { type ObjectRecordOperationUpdateInput } from '@/object-record/types/ObjectRecordOperationUpdateInput';

export const getInboxThreadUpdateFromRecordUpdate = ({
  recordId,
  updatedFields,
  updatedRecord,
}: ObjectRecordOperationUpdateInput): AiChatThreadUpdate => {
  const updatedAt = updatedRecord?.updatedAt;

  return {
    id: recordId,
    ...(isString(updatedAt) ? { updatedAt } : {}),
    ...(Object.assign({}, ...updatedFields) as Partial<AiChatThreadRecord>),
  };
};
