import { type ReactNode } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';

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
}: AiChatThreadPageContentProps) => (
  <RecordShowPageContent
    parameters={{
      objectNameSingular: StandardObjectNameSingular.AgentChatThread,
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
