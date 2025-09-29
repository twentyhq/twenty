import { t } from '@lingui/core/macro';
import { Button } from 'twenty-ui/input';

export const SendMessageButton = ({
  handleSendMessage,
  input,
  isLoading,
}: {
  agentId: string;
  handleSendMessage: () => void;
  input: string;
  isLoading: boolean;
}) => {
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
