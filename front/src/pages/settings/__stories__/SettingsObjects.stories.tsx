import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/testing/sleep';

import { SettingsObjects } from '../SettingsObjects';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsObjects',
  component: SettingsObjects,
  decorators: [PageDecorator],
  args: { routePath: '/settings/objects' },
  parameters: {
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsObjects>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(1000);

    await canvas.getByRole('heading', {
      level: 2,
      name: 'Objects',
    });
  },
};
