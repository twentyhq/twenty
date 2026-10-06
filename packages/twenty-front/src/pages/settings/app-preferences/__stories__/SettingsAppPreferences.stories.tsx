import { type Meta, type StoryObj } from '@storybook/react-vite';
import { within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsAppPreferences } from '~/pages/settings/app-preferences/SettingsAppPreferences';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/AppPreferences/SettingsAppPreferences',
  component: SettingsAppPreferences,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/accounts',
  },
  parameters: {
    layout: 'fullscreen',
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAppPreferences>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Connected accounts', undefined, {
      timeout: 3000,
    });
  },
};
