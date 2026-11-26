import { type ReactNode } from 'react';

import { useInboxObjectNames } from '@/ai-chat/hooks/useInboxObjectNames';
import { RecordShowPageContent } from '@/object-record/record-show/components/RecordShowPageContent';

type AiChatThreadPageContentProps = {
  threadId: string;
  headerActions?: ReactNode;
  headerTitle?: ReactNode;
  headerTitlePrefix?: ReactNode;
  headerTitleAccessory?: ReactNode;
};

export const AiChatThreadPageContent = ({
  threadId,
  headerActions,
  headerTitle,
  headerTitlePrefix,
  headerTitleAccessory,
}: AiChatThreadPageContentProps) => {
  const inboxObjectNames = useInboxObjectNames();

  return (
    <RecordShowPageContent
      parameters={{
        objectNameSingular: inboxObjectNames.agentChatThread,
        objectRecordId: threadId,
      }}
      headerActions={headerActions}
      headerTitle={headerTitle}
      headerTitlePrefix={headerTitlePrefix}
      headerTitleAccessory={headerTitleAccessory}
      headerTitleMode="record-title"
      isRecordIdentifierBarHidden
    />
  );
};
