import type { Meta, StoryObj } from '@storybook/react';

import { App } from '~/App';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { render } from './shared';

const meta: Meta<typeof App> = {
  title: 'App/App',
  component: App,
};

export default meta;
export type Story = StoryObj<typeof App>;

export const Default: Story = {
  render,
  parameters: {
    msw: graphqlMocks,
  },
};
