import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { SettingsDevelopersWebhookDetail } from '../../webhooks/components/SettingsDevelopersWebhookDetail';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Webhooks/SettingsDevelopersWebhookDetail',
  component: SettingsDevelopersWebhookDetail,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/webhooks/:webhookId',
    routeParams: { ':webhookId': '1234' },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsDevelopersWebhookDetail>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(
      'We will send POST requests to this endpoint for every new event',
      undefined,
      { timeout: 10000 },
    );
    await canvas.findByText('Delete this webhook');
  },
};
