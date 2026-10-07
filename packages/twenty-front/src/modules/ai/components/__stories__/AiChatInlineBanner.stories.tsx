import { Button } from 'twenty-ui/primitives/input';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { IconExternalLink } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatInlineBanner } from '@/ai/components/AiChatInlineBanner';

const onConfigureModels = fn();
const onUpgrade = fn();
const onViewDocs = fn();

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
      <Button
        size="sm"
        variant="outline"
        color="danger"
        onClick={onConfigureModels}
      >
        Configure models
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('No AI models are enabled.')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Configure models' }),
    );
    await expect(onConfigureModels).toHaveBeenCalledTimes(1);
  },
};

export const NoSettingsPermission: Story = {
  args: {
    children: 'Ask your workspace admin to enable an AI model.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Ask your workspace admin to enable an AI model.'),
    ).toBeVisible();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const UsageLimit: Story = {
  args: {
    children: 'You’ve reached your AI usage limit.',
    action: (
      <Button size="sm" variant="outline" color="danger" onClick={onUpgrade}>
        Upgrade
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const message = canvas.getByText('You’ve reached your AI usage limit.');
    const button = canvas.getByRole('button', { name: 'Upgrade' });

    await expect(message).toBeVisible();
    await userEvent.tab();
    await expect(message).toHaveFocus();
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onUpgrade).toHaveBeenCalledTimes(1);
  },
};

export const UsageLimitLoading: Story = {
  args: {
    children: 'You’ve reached your AI usage limit.',
    action: (
      <Button
        size="sm"
        variant="outline"
        color="danger"
        onClick={onUpgrade}
        disabled
      >
        Upgrade
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Upgrade' });

    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(onUpgrade).not.toHaveBeenCalled();
  },
};

export const NoBillingPermission: Story = {
  args: {
    children: 'AI usage limit reached. Ask an admin to upgrade the plan.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText(
        'AI usage limit reached. Ask an admin to upgrade the plan.',
      ),
    ).toBeVisible();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
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
        onClick={onViewDocs}
      >
        View Docs
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Add an API key to enable AI.'),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'View Docs' }));
    await expect(onViewDocs).toHaveBeenCalledTimes(1);
  },
};

export const NarrowComposer: Story = {
  args: ApiKeyNotConfigured.args,
  parameters: { container: { width: 320 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const message = canvas.getByText('Add an API key to enable AI.');
    const body = within(canvasElement.ownerDocument.body);

    await expect(message.scrollWidth).toBeGreaterThan(message.clientWidth);
    await userEvent.hover(message);
    await expect(await body.findByRole('tooltip')).toHaveTextContent(
      'Add an API key to enable AI.',
    );
    await userEvent.unhover(message);
    await waitFor(async () => {
      await expect(body.queryByRole('tooltip')).not.toBeInTheDocument();
    });
    await userEvent.click(canvas.getByRole('button', { name: 'View Docs' }));
    await expect(onViewDocs).toHaveBeenCalledTimes(1);
  },
};
