import { Button } from 'twenty-ui/input';
import { t } from '@lingui/core/macro';
import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const SendMessageButton = ({
  records,
  agentId,
}: {
  agentId: string;
  records?: ObjectRecord[];
}) => {
  const { isLoading, handleSendMessage, input } = useAgentChat(
    agentId,
    records,
  );

  return (
    <Button
      variant="primary"
      accent="blue"
      size="small"
      hotkeys={input && !isLoading ? ['⏎'] : undefined}
      disabled={!input || isLoading}
      title={t`Send`}
      onClick={handleSendMessage}
    />
  );
};
