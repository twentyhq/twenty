import { type ReactNode } from 'react';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { AiChatThreadDetailsDropdown } from '@/ai/components/AiChatThreadDetailsDropdown';
import { useObjectMetadataItemByUniversalIdentifier } from '@/object-metadata/hooks/useObjectMetadataItemByUniversalIdentifier';
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
  const { objectMetadataItem } = useObjectMetadataItemByUniversalIdentifier({
    universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
  });

  return (
    <RecordShowPageContent
      parameters={{
        objectNameSingular: objectMetadataItem.nameSingular,
        objectRecordId: threadId,
      }}
      headerActions={headerActions}
      headerTitlePrefix={headerTitlePrefix}
      headerTitleAccessory={<AiChatThreadDetailsDropdown threadId={threadId} />}
      headerTitleMode="record-title"
      isRecordIdentifierBarHidden
    />
  );
};
