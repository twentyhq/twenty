import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { SettingsApiKeys } from '~/pages/settings/developers/SettingsApiKeys';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Developers/ApiKeys',
  component: SettingsApiKeys,
  decorators: [PageDecorator],
  args: { routePath: '/settings/api-keys' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsApiKeys>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('API keys', undefined, {
      timeout: 3000,
    });
  },
};