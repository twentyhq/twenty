import { type Decorator } from '@storybook/react-vite';

import { AiChatTestInstance } from '@/ai-chat/testing/AiChatTestInstance';

export const AiChatInstanceDecorator: Decorator = (Story, context) => (
  <AiChatTestInstance threadId={context.parameters.aiChatThreadId}>
    <Story />
  </AiChatTestInstance>
);
