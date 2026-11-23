import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export type AiChatThreadVisit = {
  threadId: string;
  isUnread: boolean;
  lastReadAt: string | null;
  isKeptUnread: boolean;
  readRequestedForActivityAt?: string;
  readRequestedForParticipantUpdatedAt?: string;
};

export const aiChatThreadViewVisitFamilyState = createAtomFamilyState<
  AiChatThreadVisit | null,
  { threadId: string }
>({
  key: 'aiChatThreadViewVisitFamilyState',
  defaultValue: null,
});
