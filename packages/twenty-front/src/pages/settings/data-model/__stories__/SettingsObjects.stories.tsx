import { type Meta, type StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsObjects } from '~/pages/settings/data-model/SettingsObjects';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/DataModel/SettingsObjects',
  component: SettingsObjects,
  decorators: [PageDecorator],
  args: { routePath: '/settings/objects' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsObjects>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Existing objects', undefined, { timeout: 5000 });
  },
};
