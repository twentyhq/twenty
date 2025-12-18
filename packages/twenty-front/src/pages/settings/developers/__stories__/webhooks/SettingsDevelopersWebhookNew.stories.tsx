import { type Meta, type StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { SettingsDevelopersWebhookNew } from '~/pages/settings/developers/webhooks/components/SettingsDevelopersWebhookNew';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Webhooks/SettingsDevelopersWebhookNew',
  component: SettingsDevelopersWebhookNew,
  decorators: [I18nFrontDecorator, PageDecorator],
  args: {
    routePath: '/settings/webhooks/new',
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsDevelopersWebhookNew>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('New Webhook', undefined, { timeout: 3000 });
    await canvas.findByText(
      'We will send a POST request to this endpoint for each new event in application/json format',
    );
    await canvas.findByPlaceholderText('https://example.com/webhook');
  },
};
