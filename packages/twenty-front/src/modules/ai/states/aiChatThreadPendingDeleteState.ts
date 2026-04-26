import { type AiChatThreadActionsSurface } from '@/ai/constants/AiChatThreadActionsSurface';
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
