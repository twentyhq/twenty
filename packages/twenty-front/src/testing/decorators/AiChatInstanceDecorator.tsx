import { type Decorator } from '@storybook/react-vite';

import { AiChatTestInstance } from '@/ai-chat/testing/AiChatTestInstance';

export const AiChatInstanceDecorator: Decorator = (Story) => (
  <AiChatTestInstance>
    <Story />
  </AiChatTestInstance>
);
