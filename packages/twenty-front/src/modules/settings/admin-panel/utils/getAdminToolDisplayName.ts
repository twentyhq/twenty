import { isNonEmptyString } from '@sniptt/guards';

import { type AdminChatThreadMessagePart } from '@/settings/admin-panel/types/AdminChatThreadMessagePart';

const TOOL_PART_TYPE_PREFIX = 'tool-';

export const getAdminToolDisplayName = (
  part: AdminChatThreadMessagePart,
): string => {
  if (isNonEmptyString(part.toolName)) {
    return part.toolName;
  }

  if (part.type.startsWith(TOOL_PART_TYPE_PREFIX)) {
    return part.type.slice(TOOL_PART_TYPE_PREFIX.length);
  }

  return part.type;
};
