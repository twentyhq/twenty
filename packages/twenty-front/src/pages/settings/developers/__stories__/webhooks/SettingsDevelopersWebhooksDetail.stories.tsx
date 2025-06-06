import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { HttpResponse, graphql } from 'msw';

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
    msw: {
      handlers: [
        graphql.query('FindOneWebhook', () => {
          return HttpResponse.json({
            data: {
              webhook: {
                id: '1234',
                createdAt: '2021-08-27T12:00:00Z',
                targetUrl: 'https://example.com/webhook',
                description: 'A Sample Description',
                updatedAt: '2021-08-27T12:00:00Z',
                operations: ['*.created', '*.updated'],
                secret: 'sample-secret-key',
                __typename: 'Webhook',
              },
            },
          });
        }),
        ...graphqlMocks.handlers,
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
