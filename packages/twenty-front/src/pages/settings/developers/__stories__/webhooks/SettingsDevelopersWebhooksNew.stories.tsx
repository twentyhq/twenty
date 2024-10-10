import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { SettingsDevelopersWebhooksNew } from '~/pages/settings/developers/webhooks/components/SettingsDevelopersWebhooksNew';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Developers/Webhooks/SettingsDevelopersWebhooksNew',
  component: SettingsDevelopersWebhooksNew,
  decorators: [PageDecorator],
  args: { routePath: '/settings/developers' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsDevelopersWebhooksNew>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(
      'We will send POST requests to this endpoint for every new event',
    );
  },
};
