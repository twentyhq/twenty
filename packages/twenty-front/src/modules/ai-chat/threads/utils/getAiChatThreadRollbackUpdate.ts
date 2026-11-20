import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';

type AiChatThreadUpdate = Partial<AiChatThreadRecord> & { id: string };

// Fields changed together are restored together, or not at all
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
  const optimisticEntries = Object.entries(optimisticFields);
  const isStillOptimistic = optimisticEntries.every(
    ([field, optimisticValue]) =>
      (currentThread?.[field] ?? null) === (optimisticValue ?? null),
  );

  if (!isStillOptimistic || optimisticEntries.length === 0) {
    return null;
  }

  return {
    id,
    ...Object.fromEntries(
      optimisticEntries.map(([field]) => [
        field,
        previousThread?.[field] ?? null,
      ]),
    ),
  };
};
