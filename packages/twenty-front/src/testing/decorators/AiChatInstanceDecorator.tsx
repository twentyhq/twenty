import { type Decorator } from '@storybook/react-vite';

import { AiChatTestDisplayedThreadInitEffect } from '@/ai/testing/AiChatTestDisplayedThreadInitEffect';
import { AiChatTestInstance } from '@/ai/testing/AiChatTestInstance';

export const AiChatInstanceDecorator: Decorator = (Story) => (
  <AiChatTestInstance>
    <AiChatTestDisplayedThreadInitEffect />
    <Story />
  </AiChatTestInstance>
);
