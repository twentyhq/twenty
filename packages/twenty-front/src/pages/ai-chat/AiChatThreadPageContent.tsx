import { type ReactNode } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { AiChatThreadDetailsDropdown } from '@/ai/components/AiChatThreadDetailsDropdown';
import { RecordShowPageContent } from '~/pages/object-record/RecordShowPageContent';

type AiChatThreadPageContentProps = {
  threadId: string;
  headerActions?: ReactNode;
};

// A chat is its record page, full page, in the inbox or in the side panel
export const AiChatThreadPageContent = ({
  threadId,
  headerActions,
}: AiChatThreadPageContentProps) => (
  <RecordShowPageContent
    parameters={{
      objectNameSingular: CoreObjectNameSingular.AgentChatThread,
      objectRecordId: threadId,
    }}
    headerActions={headerActions}
    headerTitleAccessory={<AiChatThreadDetailsDropdown threadId={threadId} />}
    headerTitleMode="record-title"
    isRecordIdentifierBarHidden
  />
);
