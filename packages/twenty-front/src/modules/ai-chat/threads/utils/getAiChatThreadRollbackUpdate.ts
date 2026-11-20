import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';

type AiChatThreadUpdate = Partial<AiChatThreadRecord> & { id: string };

export const getAiChatThreadRollbackUpdate = ({
  optimisticUpdate,
  previousThread,
  currentThread,
}: {
  optimisticUpdate: AiChatThreadUpdate;
  previousThread: AiChatThreadRecord | null;
  currentThread: AiChatThreadRecord | null;
}): AiChatThreadUpdate | null => {
  const { id, ...optimisticFields } = optimisticUpdate;
  const restoredFields = Object.fromEntries(
    Object.entries(optimisticFields)
      .filter(
        ([field, optimisticValue]) =>
          (currentThread?.[field] ?? null) === (optimisticValue ?? null),
      )
      .map(([field]) => [field, previousThread?.[field] ?? null]),
  );

  return Object.keys(restoredFields).length > 0
    ? { id, ...restoredFields }
    : null;
};
