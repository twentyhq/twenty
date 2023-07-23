import { Meta } from '@storybook/react';

import { App } from '~/App';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { Story } from './App.stories';
import { renderWithDarkMode } from './shared';

const meta: Meta<typeof App> = {
  title: 'App/App/DarkMode',
  component: App,
};

export default meta;

export const DarkMode: Story = {
  render: () => renderWithDarkMode(true),
  parameters: {
    msw: graphqlMocks,
  },
};
