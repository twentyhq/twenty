import { type Meta, type StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';

import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { SettingsDevelopersWebhookDetail } from '~/pages/settings/developers/webhooks/components/SettingsDevelopersWebhookDetail';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Webhooks/SettingsDevelopersWebhookDetail',
  component: SettingsDevelopersWebhookDetail,
  decorators: [I18nFrontDecorator, PageDecorator],
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

    await canvas.findByText('Delete this webhook');
  },
};
