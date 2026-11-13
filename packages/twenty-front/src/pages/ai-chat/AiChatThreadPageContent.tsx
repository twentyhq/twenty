import { type ReactNode } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';

import { InboxDirectMessageTitle } from '@/ai/components/AiChatDirectMessageTitle';
import { InboxThreadDetailsDropdown } from '@/ai/components/AiChatThreadDetailsDropdown';
import { inboxThreadIsDirectMessageFamilySelector } from '@/ai/states/selectors/agentChatThreadIsDirectMessageFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { RecordShowPageContent } from '~/pages/object-record/RecordShowPageContent';

type InboxThreadPageContentProps = {
  threadId: string;
  headerActions?: ReactNode;
  headerTitlePrefix?: ReactNode;
};

// A chat is its record page, full page, in the inbox or in the side panel
export const InboxThreadPageContent = ({
  threadId,
  headerActions,
  headerTitlePrefix,
}: InboxThreadPageContentProps) => {
  const isDirectMessage = useAtomFamilySelectorValue(
    inboxThreadIsDirectMessageFamilySelector,
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
          <InboxDirectMessageTitle threadId={threadId} />
        ) : undefined
      }
      headerTitlePrefix={headerTitlePrefix}
      headerTitleAccessory={<InboxThreadDetailsDropdown threadId={threadId} />}
      headerTitleMode="record-title"
      isRecordIdentifierBarHidden
    />
  );
};
