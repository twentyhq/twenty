import { type Decorator } from '@storybook/react-vite';

import { AiChatTestInstance } from '@/ai/testing/AiChatTestInstance';

export const AiChatInstanceDecorator: Decorator = (Story) => (
  <AiChatTestInstance>
    <Story />
  </AiChatTestInstance>
);
