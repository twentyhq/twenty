import { AiChatNewThreadRecipientField } from '@/ai/components/AiChatNewThreadRecipientField';
import { useIsOnNewAiChatSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { aiChatIsSendingMessageFamilyState } from '@/ai/states/aiChatIsSendingMessageFamilyState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const AiChatNewThreadRecipientBar = () => {
  const isOnNewAiChatSlot = useIsOnNewAiChatSlot();
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const aiChatIsSendingMessage = useAtomFamilyStateValue(
    aiChatIsSendingMessageFamilyState,
    { threadId: newAiChatThreadId },
  );

  if (
    !isAiChatInboxEnabled ||
    !isOnNewAiChatSlot ||
    isWorkspaceSetupChat ||
    aiChatIsSendingMessage
  ) {
    return null;
  }

  return <AiChatNewThreadRecipientField />;
};
