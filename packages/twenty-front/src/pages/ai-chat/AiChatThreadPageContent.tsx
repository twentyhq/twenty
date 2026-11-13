import { type ReactNode } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';

import { AiChatDirectMessageTitle } from '@/ai/components/AiChatDirectMessageTitle';
import { AiChatThreadDetailsDropdown } from '@/ai/components/AiChatThreadDetailsDropdown';
import { agentChatThreadIsDirectMessageFamilySelector } from '@/ai/states/selectors/agentChatThreadIsDirectMessageFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { RecordShowPageContent } from '~/pages/object-record/RecordShowPageContent';

type AiChatThreadPageContentProps = {
  threadId: string;
  headerActions?: ReactNode;
  headerTitlePrefix?: ReactNode;
};

// A chat is its record page, full page, in the inbox or in the side panel
export const AiChatThreadPageContent = ({
  threadId,
  headerActions,
  headerTitlePrefix,
}: AiChatThreadPageContentProps) => {
  const isDirectMessage = useAtomFamilySelectorValue(
    agentChatThreadIsDirectMessageFamilySelector,
    threadId,
  );

  return (
    <RecordShowPageContent
      parameters={{
        objectNameSingular: StandardObjectNameSingular.AgentChatThread,
        objectRecordId: threadId,
      }}
      headerActions={headerActions}
      headerTitle={
        isDirectMessage ? (
          <AiChatDirectMessageTitle threadId={threadId} />
        ) : undefined
      }
      headerTitlePrefix={headerTitlePrefix}
      headerTitleAccessory={<AiChatThreadDetailsDropdown threadId={threadId} />}
      headerTitleMode="record-title"
      isRecordIdentifierBarHidden
    />
  );
};
