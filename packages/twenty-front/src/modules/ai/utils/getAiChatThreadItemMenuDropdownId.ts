import { getAiChatThreadActionsInstanceId } from '@/ai/utils/getAiChatThreadActionsInstanceId';
import { type AiChatThreadActionsSurface } from '@/ai/types/AiChatThreadActionsSurface';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';

// Command menu items close the dropdown of their command menu instance
export const getAiChatThreadItemMenuDropdownId = ({
  threadId,
  surface,
}: {
  threadId: string;
  surface: AiChatThreadActionsSurface;
}) =>
  getCommandMenuDropdownIdFromCommandMenuId(
    getAiChatThreadActionsInstanceId({ threadId, surface }),
  );
