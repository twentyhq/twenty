import { isDefined } from 'twenty-shared/utils';

import { type AiChatSurface } from '@/ai-chat/types/AiChatSurface';

export const getIsWorkspaceSetupChat = ({
  surface,
  isWorkspaceSetupChatActive,
}: {
  surface: AiChatSurface | null | undefined;
  isWorkspaceSetupChatActive: boolean;
}) => isWorkspaceSetupChatActive && isDefined(surface);
