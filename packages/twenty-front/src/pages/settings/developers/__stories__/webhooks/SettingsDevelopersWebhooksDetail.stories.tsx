import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { HttpResponse } from 'msw';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks, metadataGraphql } from '~/testing/graphqlMocks';
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
    msw: {
      handlers: [
        ...graphqlMocks.handlers,
        metadataGraphql.query('GetWebhook', () => {
          return HttpResponse.json({
            data: {
              webhook: {
                __typename: 'Webhook',
                id: '1234',
                targetUrl: 'https://example.com/webhook',
                operations: ['*.created', '*.updated'],
                description: 'A Sample Description',
                secret: 'sample-secret',
              },
            },
          });
        }),
      ],
    },
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
