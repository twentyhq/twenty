import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatUnreadLine } from '@/ai/components/AiChatUnreadLine';

const meta: Meta<typeof AiChatUnreadLine> = {
  title: 'Modules/AI/AiChatUnreadLine',
  component: AiChatUnreadLine,
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 744 },
  },
};

export default meta;
type Story = StoryObj<typeof AiChatUnreadLine>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('separator', { name: 'New messages' }),
    ).toHaveTextContent('New');
  },
};
