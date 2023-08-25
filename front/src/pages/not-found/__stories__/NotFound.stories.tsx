import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { PageDecoratorArgs } from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { NotFound } from '../NotFound';
const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/NotFound/Default',
  component: NotFound,
  decorators: [ComponentWithRouterDecorator],
  args: {
    routePath: 'toto-not-found',
  },
  parameters: {
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof NotFound>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Page not found');
  },
};
