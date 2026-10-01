import { type ReactNode } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { AiChatThreadDetailsDropdown } from '@/ai/components/AiChatThreadDetailsDropdown';
import { AiChatThreadTriageHotkeysEffect } from '@/ai/components/AiChatThreadTriageHotkeysEffect';
import { RecordShowPageContent } from '~/pages/object-record/RecordShowPage';

type AiChatThreadPageContentProps = {
  threadId: string;
  headerActions?: ReactNode;
};

// A chat on the main page, full page or in the inbox, is its record page
export const AiChatThreadPageContent = ({
  threadId,
  headerActions,
}: AiChatThreadPageContentProps) => (
  <>
    <AiChatThreadTriageHotkeysEffect threadId={threadId} />
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
  </>
);
