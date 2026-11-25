import { useAiChatThreadRecordTargets } from '@/ai-chat/threads/hooks/useAiChatThreadRecordTargets';
import { SidePanelLinkAiChatToRecordsResults } from '@/side-panel/pages/link-ai-chat-to-records/components/SidePanelLinkAiChatToRecordsResults';

type SidePanelLinkAiChatToRecordsListProps = {
  threadId: string;
};

export const SidePanelLinkAiChatToRecordsList = ({
  threadId,
}: SidePanelLinkAiChatToRecordsListProps) => {
  const {
    isAvailable,
    targetRecords,
    searchableObjectNameSingulars,
    toggleRecordTarget,
  } = useAiChatThreadRecordTargets({
    threadId,
    instanceId: `ai-chat-link-records-${threadId}`,
  });

  if (!isAvailable) {
    return null;
  }

  return (
    <SidePanelLinkAiChatToRecordsResults
      linkedRecordIds={targetRecords.map(({ record }) => record.id)}
      searchableObjectNameSingulars={searchableObjectNameSingulars}
      onToggle={toggleRecordTarget}
    />
  );
};
