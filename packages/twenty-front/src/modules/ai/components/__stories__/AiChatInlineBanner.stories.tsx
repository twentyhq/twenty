import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconExternalLink } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatInlineBanner } from '@/ai/components/AiChatInlineBanner';

const meta: Meta<typeof AiChatInlineBanner> = {
  title: 'Modules/AI/AiChatInlineBanner',
  component: AiChatInlineBanner,
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 744 },
  },
};

export default meta;
type Story = StoryObj<typeof AiChatInlineBanner>;

export const NoEnabledModels: Story = {
  args: {
    message: 'No AI models are enabled.',
    button: { title: 'Configure models', onClick: () => {} },
  },
};

export const NoSettingsPermission: Story = {
  args: {
    message: 'Ask your workspace admin to enable an AI model.',
  },
};

export const UsageLimit: Story = {
  args: {
    message: 'You’ve reached your AI usage limit.',
    button: { title: 'Upgrade', onClick: () => {} },
  },
};

export const UsageLimitLoading: Story = {
  args: {
    ...UsageLimit.args,
    button: { title: 'Upgrade', onClick: () => {}, disabled: true },
  },
};

export const NoBillingPermission: Story = {
  args: {
    message: 'AI usage limit reached. Ask an admin to upgrade the plan.',
  },
};

export const ApiKeyNotConfigured: Story = {
  args: {
    message: 'Add an API key to enable AI.',
    button: {
      title: 'View Docs',
      Icon: IconExternalLink,
      onClick: () => {},
    },
  },
};

export const NarrowComposer: Story = {
  args: ApiKeyNotConfigured.args,
  parameters: { container: { width: 320 } },
};
