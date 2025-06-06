import { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';

import { SettingsDevelopersWebhookForm } from '@/settings/developers/components/SettingsDevelopersWebhookForm';
import { WebhookFormMode } from '@/settings/developers/constants/WebhookFormMode';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<typeof SettingsDevelopersWebhookForm> = {
  title: 'Modules/Settings/Developers/Components/SettingsDevelopersWebhookForm',
  component: SettingsDevelopersWebhookForm,
  decorators: [
    ComponentDecorator,
    I18nFrontDecorator,
    RouterDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsDevelopersWebhookForm>;

export const CreateMode: Story = {
  args: {
    mode: WebhookFormMode.Create,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('New Webhook', undefined, { timeout: 10000 });
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
  parameters: {
    msw: graphqlMocks,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByDisplayValue('https://example.com/webhook', undefined, {
      timeout: 10000,
    });
    await canvas.findByDisplayValue('A Sample Description');

    await canvas.findByText('Danger zone');
    await canvas.findByText('Delete this webhook');
  },
};
