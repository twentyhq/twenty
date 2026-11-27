import { type ReactNode } from 'react';

import { inboxNamesByLegacyNameSelector } from '@/ai-chat/states/selectors/inboxNamesByLegacyNameSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
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
  const inboxNamesByLegacyName = useAtomStateValue(
    inboxNamesByLegacyNameSelector,
  );

  return (
    <RecordShowPageContent
      parameters={{
        objectNameSingular: inboxNamesByLegacyName.agentChatThread,
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
