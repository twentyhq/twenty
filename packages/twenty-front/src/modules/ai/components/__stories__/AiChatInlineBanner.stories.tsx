import { Button } from 'twenty-ui/primitives/input';
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
    children: 'No AI models are enabled.',
    action: (
      <Button size="sm" variant="outline" color="danger">
        Configure models
      </Button>
    ),
  },
};

export const NoSettingsPermission: Story = {
  args: {
    children: 'Ask your workspace admin to enable an AI model.',
  },
};

export const UsageLimit: Story = {
  args: {
    children: 'You’ve reached your AI usage limit.',
    action: (
      <Button size="sm" variant="outline" color="danger">
        Upgrade
      </Button>
    ),
  },
};

export const UsageLimitLoading: Story = {
  args: {
    children: 'You’ve reached your AI usage limit.',
    action: (
      <Button size="sm" variant="outline" color="danger" disabled>
        Upgrade
      </Button>
    ),
  },
};

export const NoBillingPermission: Story = {
  args: {
    children: 'AI usage limit reached. Ask an admin to upgrade the plan.',
  },
};

export const ApiKeyNotConfigured: Story = {
  args: {
    children: 'Add an API key to enable AI.',
    action: (
      <Button
        size="sm"
        variant="outline"
        color="danger"
        startIcon={<IconExternalLink />}
      >
        View Docs
      </Button>
    ),
  },
};

export const NarrowComposer: Story = {
  args: {
    children: 'Add an API key to enable AI.',
    action: (
      <Button
        size="sm"
        variant="outline"
        color="danger"
        startIcon={<IconExternalLink />}
      >
        View Docs
      </Button>
    ),
  },
  parameters: { container: { width: 320 } },
};
