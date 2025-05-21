import { TagColor } from 'twenty-ui/components';

type ChatbotStatus = 'DRAFT' | 'ACTIVE' | 'DEACTIVATED';

export const chatbotStatusTagProps = ({
  chatbotStatus,
}: {
  chatbotStatus: ChatbotStatus;
}): { color: TagColor; text: string } => {
  if (chatbotStatus === 'DRAFT') {
    return {
      color: 'yellow',
      text: 'Draft',
    };
  }

  if (chatbotStatus === 'ACTIVE') {
    return {
      color: 'green',
      text: 'Active',
    };
  }

  return {
    color: 'gray',
    text: 'Deactivated',
  };
};
