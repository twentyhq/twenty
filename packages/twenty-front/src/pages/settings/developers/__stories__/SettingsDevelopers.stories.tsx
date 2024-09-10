import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { SettingsDevelopers } from '~/pages/settings/developers/SettingsDevelopers';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Developers/SettingsDevelopers',
  component: SettingsDevelopers,
  decorators: [PageDecorator],
  args: { routePath: '/settings/developers' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsDevelopers>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('API keys', undefined, {
      timeout: 3000,
    });
  },
};
