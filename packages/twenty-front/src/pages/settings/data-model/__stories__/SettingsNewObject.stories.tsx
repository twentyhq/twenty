import { Meta, StoryObj } from '@storybook/react';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/testing/sleep';

import { SettingsNewObject } from '../SettingsNewObject';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/DataModel/SettingsNewObject',
  component: SettingsNewObject,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/objects/new',
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsNewObject>;

export const WithStandardSelected: Story = {
  play: async () => {
    await sleep(100);
  },
};
