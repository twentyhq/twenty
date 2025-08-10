import { type Meta, type StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { SettingsWebhooks } from '~/pages/settings/developers/webhooks/components/SettingsWebhooks';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Webhooks',
  component: SettingsWebhooks,
  decorators: [PageDecorator],
  args: { routePath: '/settings/webhooks' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsWebhooks>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findAllByText('Webhooks', undefined, {
      timeout: 3000,
    });
  },
};
