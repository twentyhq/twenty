import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { SettingsDevelopersWebhooks } from '~/pages/settings/developers/webhooks/SettingsDevelopersWebhooks';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Developers/SettingsDevelopersWebhooks',
  component: SettingsDevelopersWebhooks,
  decorators: [PageDecorator],
  args: { routePath: '/settings/developers' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsDevelopersWebhooks>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(
      'Establish Webhook endpoints for notifications on asynchronous events.',
    );
  },
};
