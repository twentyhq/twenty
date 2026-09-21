import { isNonEmptyString } from '@sniptt/guards';

import { type AdminChatThreadMessagePart } from '@/settings/admin-panel/types/AdminChatThreadMessagePart';

export const isRenderableAdminChatMessagePart = (
  part: AdminChatThreadMessagePart,
): boolean =>
  (part.type === 'text' && isNonEmptyString(part.textContent)) ||
  (part.type === 'reasoning' && isNonEmptyString(part.reasoningContent)) ||
  part.type.startsWith('tool-') ||
  part.type === 'dynamic-tool';
