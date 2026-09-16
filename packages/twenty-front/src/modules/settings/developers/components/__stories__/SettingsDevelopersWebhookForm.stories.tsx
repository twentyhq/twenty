import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, within } from 'storybook/test';

import { SettingsDevelopersWebhookForm } from '@/settings/developers/components/SettingsDevelopersWebhookForm';
import { WebhookFormMode } from '@/settings/developers/constants/WebhookFormMode';
import { Toaster } from 'twenty-ui/primitives/feedback';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<typeof SettingsDevelopersWebhookForm> = {
  title: 'Modules/Settings/Developers/Components/SettingsDevelopersWebhookForm',
  component: SettingsDevelopersWebhookForm,
  decorators: [
    ComponentDecorator,
    RouterDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

type Story = StoryObj<typeof SettingsDevelopersWebhookForm>;

export const CreateMode: Story = {
  args: {
    mode: WebhookFormMode.Create,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('New Webhook', undefined, { timeout: 3000 });
    await canvas.findByPlaceholderText('https://example.com/webhook');
    await canvas.findByPlaceholderText('Write a description');

    expect(canvas.queryByText('Danger zone')).not.toBeInTheDocument();
  },
};

export const EditMode: Story = {
  args: {
    mode: WebhookFormMode.Edit,
    webhookId: '1234',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByDisplayValue(
      'https://api.slackbot.io/webhooks/twenty',
      undefined,
      {
        timeout: 3000,
      },
    );
    await canvas.findByDisplayValue('Slack notifications for lead updates');

    const allObjectsLabels = await canvas.findAllByText('All Objects');
    expect(allObjectsLabels).toHaveLength(2);
    await canvas.findByText('Created');
    await canvas.findByText('Updated');

    await canvas.findByText('Danger zone');
    await canvas.findByText('Delete this webhook');
  },
};

export const QueryError: Story = {
  args: {
    mode: WebhookFormMode.Edit,
    webhookId: 'unavailable-webhook',
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster getToastProps={() => ({ progress: 100 })} />
      </>
    ),
  ],
  parameters: {
    msw: {
      handlers: [
        graphql.query('GetWebhook', () =>
          HttpResponse.json({
            errors: [{ message: 'Connection lost' }],
          }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const toast = await canvas.findByRole('status');

    expect(toast).toHaveTextContent('Failed to load webhook');
    expect(canvas.getAllByRole('status')).toHaveLength(1);
    expect(canvas.queryByText('Connection lost')).not.toBeInTheDocument();
  },
};
