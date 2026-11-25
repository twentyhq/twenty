import { type ReactNode } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';

import { RecordShowPageContent } from '@/object-record/record-show/components/RecordShowPageContent';

type AiChatThreadPageContentProps = {
  threadId: string;
  headerActions?: ReactNode;
  headerTitle?: ReactNode;
  headerTitlePrefix?: ReactNode;
};

export const AiChatThreadPageContent = ({
  threadId,
  headerActions,
  headerTitle,
  headerTitlePrefix,
}: AiChatThreadPageContentProps) => (
  <RecordShowPageContent
    parameters={{
      objectNameSingular: StandardObjectNameSingular.AgentChatThread,
      objectRecordId: threadId,
    }}
    headerActions={headerActions}
    headerTitle={headerTitle}
    headerTitlePrefix={headerTitlePrefix}
    headerTitleMode="record-title"
    isRecordIdentifierBarHidden
  />
);
