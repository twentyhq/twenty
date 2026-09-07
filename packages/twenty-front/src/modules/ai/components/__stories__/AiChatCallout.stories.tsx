import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconExternalLink } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatCallout } from '@/ai/components/AiChatCallout';

const meta: Meta<typeof AiChatCallout> = {
  title: 'Modules/AI/AiChatCallout',
  component: AiChatCallout,
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 744 },
  },
};

export default meta;
type Story = StoryObj<typeof AiChatCallout>;

export const NoEnabledModels: Story = {
  args: {
    title: "AI isn't enabled",
    description: 'Enable an AI model in workspace settings to start chatting.',
    action: { label: 'Configure models', onClick: () => {} },
  },
};

export const NoSettingsPermission: Story = {
  args: {
    title: "AI isn't enabled",
    description: 'Ask your workspace admin to enable an AI model.',
  },
};

export const UsageLimit: Story = {
  args: {
    title: 'AI usage limit reached',
    description: 'Upgrade to 10000 credits for $20/month.',
    action: { label: 'Upgrade', onClick: () => {} },
  },
};

export const UsageLimitLoading: Story = {
  args: {
    ...UsageLimit.args,
    action: { label: 'Upgrade', onClick: () => {}, disabled: true },
  },
};

export const NoBillingPermission: Story = {
  args: {
    title: 'AI usage limit reached',
    description: 'Ask an admin to upgrade the plan.',
  },
};

export const ApiKeyNotConfigured: Story = {
  args: {
    title: "AI isn't configured",
    description:
      'Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or XAI_API_KEY in your environment.',
    action: {
      label: 'View Docs',
      Icon: IconExternalLink,
      onClick: () => {},
    },
  },
};

export const NarrowComposer: Story = {
  args: ApiKeyNotConfigured.args,
  parameters: { container: { width: 320 } },
};
