import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatBanner } from '@/ai/components/AiChatBanner';

const meta: Meta<typeof AiChatBanner> = {
  title: 'Modules/AI/AiChatBanner',
  component: AiChatBanner,
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 400 },
  },
};

export default meta;
type Story = StoryObj<typeof AiChatBanner>;

export const NoEnabledModels: Story = {
  args: {
    message: 'No AI models are enabled in this workspace.',
    variant: 'warning',
  },
};

export const Default: Story = {
  args: {
    message: 'This is an informational message.',
    variant: 'default',
  },
};

export const WithButton: Story = {
  args: {
    message: "You've hit your usage limit.",
    variant: 'warning',
    buttonTitle: 'Upgrade',
    buttonOnClick: () => {},
  },
};
