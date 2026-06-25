import { type AiChatThreadActionsSurface } from '@/ai/types/AiChatThreadActionsSurface';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

type AiChatThreadPendingDelete = {
  threadId: string;
  threadTitle: string;
} | null;

export const aiChatThreadPendingDeleteFamilyState = createAtomFamilyState<
  AiChatThreadPendingDelete,
  AiChatThreadActionsSurface
>({
  key: 'aiChatThreadPendingDeleteFamilyState',
  defaultValue: null,
});
