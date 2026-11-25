import { type ComponentProps } from 'react';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { Separator } from 'twenty-ui/primitives/layout';

import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { AiChatContextChatDetailsFields } from '@/ai-chat/usage/components/AiChatContextChatDetailsFields';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type AiChatContextChatDetailsProps = Omit<
  ComponentProps<typeof AiChatContextChatDetailsFields>,
  'thread'
>;

export const AiChatContextChatDetails = ({
  onOverflowOpenChange,
  onRecordOpen,
}: AiChatContextChatDetailsProps) => {
  const { threadId } = useAiChatInstanceOrThrow();
  const thread = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    threadId,
  );
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  if (
    !isAiChatInboxEnabled ||
    !isDefined(thread) ||
    thread.conversationType === AgentChatThreadConversationType.DIRECT_MESSAGE
  ) {
    return null;
  }

  return (
    <>
      <AiChatContextChatDetailsFields
        thread={thread}
        onOverflowOpenChange={onOverflowOpenChange}
        onRecordOpen={onRecordOpen}
      />
      <Separator />
    </>
  );
};
