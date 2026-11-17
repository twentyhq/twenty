import { type Decorator } from '@storybook/react-vite';

import { AiChatInstanceDisplayedThreadEffect } from '@/ai/components/AiChatInstanceDisplayedThreadEffect';
import { AiChatTestInstance } from '@/ai/testing/AiChatTestInstance';

export const AiChatInstanceDecorator: Decorator = (Story) => (
  <AiChatTestInstance>
    <AiChatInstanceDisplayedThreadEffect />
    <Story />
  </AiChatTestInstance>
);
