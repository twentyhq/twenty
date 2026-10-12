import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SettingsDevelopersWebhookForm } from '@/settings/developers/components/SettingsDevelopersWebhookForm';
import { WebhookFormMode } from '@/settings/developers/constants/WebhookFormMode';
import { Toaster } from 'twenty-ui/components/feedback';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const meta: Meta<typeof SettingsDevelopersWebhookForm> = {
  title: 'Modules/Settings/Developers/Components/SettingsDevelopersWebhookForm',
  component: SettingsDevelopersWebhookForm,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
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

export const EntityPicker: Story = {
  args: {
    mode: WebhookFormMode.Edit,
    webhookId: '1234',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const [trigger] = await canvas.findAllByRole(
      'button',
      { name: 'All Objects' },
      { timeout: 3000 },
    );

    await userEvent.click(trigger);
    const picker = await body.findByRole('dialog', { name: 'Select entity' });
    const search = within(picker).getByRole('searchbox', { name: 'Search' });

    await waitFor(() => expect(search).toHaveFocus());
    expect(
      within(picker).getByRole('group', { name: 'Core Objects' }),
    ).toBeVisible();
    expect(
      within(picker).getByRole('group', { name: 'Metadata' }),
    ).toBeVisible();

    await userEvent.type(search, 'compan');
    expect(
      within(picker).queryByRole('group', { name: 'Metadata' }),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        within(picker).getByRole('button', { name: 'Companies' }),
      ).toHaveAttribute('data-highlighted'),
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(picker).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('Companies');

    await userEvent.click(trigger);
    const reopenedPicker = await body.findByRole('dialog', {
      name: 'Select entity',
    });

    expect(
      within(reopenedPicker).getByRole('searchbox', { name: 'Search' }),
    ).toHaveValue('');
    expect(
      within(reopenedPicker).getByRole('button', {
        name: 'Companies',
        pressed: true,
      }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(reopenedPicker).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
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
