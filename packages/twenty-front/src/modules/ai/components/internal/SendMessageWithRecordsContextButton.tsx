import { Button } from 'twenty-ui/input';
import { t } from '@lingui/core/macro';
import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { SendMessageButton } from '@/ai/components/internal/SendMessageButton';

export const SendMessageWithRecordsContextButton = ({
  agentId,
}: {
  agentId: string;
}) => {
  const { records } = useFindManyRecordsSelectedInContextStore({
    limit: 10,
  });

  return <SendMessageButton records={records} agentId={agentId} />;
};
