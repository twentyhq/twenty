import { SendMessageButton } from '@/ai/components/internal/SendMessageButton';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';

export const SendMessageWithRecordsContextButton = ({
  agentId,
}: {
  agentId: string;
}) => {
  const { records } = useFindManyRecordsSelectedInContextStore({
    limit: 10,
  });

  return <SendMessageButton agentId={agentId} records={records} />;
};
