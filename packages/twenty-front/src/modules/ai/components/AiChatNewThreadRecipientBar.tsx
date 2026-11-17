import { isDefined } from 'twenty-shared/utils';

import { AiChatNewThreadRecipientField } from '@/ai/components/AiChatNewThreadRecipientField';
import { useIsOnNewAiChatSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { aiChatIsSendingMessageFamilyState } from '@/ai/states/aiChatIsSendingMessageFamilyState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const AiChatNewThreadRecipientBar = () => {
  const isOnNewAiChatSlot = useIsOnNewAiChatSlot();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const aiChatIsSendingMessage = useAtomFamilyStateValue(
    aiChatIsSendingMessageFamilyState,
    { threadId: newAiChatThreadId },
  );

  const isCreatingChat = isOnNewAiChatSlot || !isDefined(currentAiChatThread);

  if (
    !isAiChatInboxEnabled ||
    !isCreatingChat ||
    isWorkspaceSetupChat ||
    aiChatIsSendingMessage
  ) {
    return null;
  }

  return <AiChatNewThreadRecipientField />;
};
