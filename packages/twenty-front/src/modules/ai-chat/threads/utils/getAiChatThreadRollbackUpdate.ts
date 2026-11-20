import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';

type AiChatThreadUpdate = Partial<AiChatThreadRecord> & { id: string };

// A field the server changed since the optimistic update keeps its newer value
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
          (currentThread?.[field as keyof AiChatThreadRecord] ?? null) ===
          (optimisticValue ?? null),
      )
      .map(([field]) => [
        field,
        previousThread?.[field as keyof AiChatThreadRecord] ?? null,
      ]),
  );

  return Object.keys(restoredFields).length > 0
    ? { id, ...restoredFields }
    : null;
};
