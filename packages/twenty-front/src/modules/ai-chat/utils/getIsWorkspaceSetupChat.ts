import { isDefined } from 'twenty-shared/utils';

import { type AiChatSurface } from '@/ai-chat/types/AiChatSurface';

export const getIsWorkspaceSetupChat = ({
  surface,
  shouldOpenAiChatAfterOnboarding,
}: {
  surface: AiChatSurface | null | undefined;
  shouldOpenAiChatAfterOnboarding: boolean;
}) => shouldOpenAiChatAfterOnboarding && isDefined(surface);
