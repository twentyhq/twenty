import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { PageDecoratorArgs } from '~/testing/decorators/PageDecorator';
import { RelationPickerDecorator } from '~/testing/decorators/RelationPickerDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { NotFound } from '../NotFound';
const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/NotFound/Default',
  component: NotFound,
  decorators: [
    ComponentWithRouterDecorator,
    SnackBarDecorator,
    RelationPickerDecorator,
  ],
  args: {
    routePath: 'toto-not-found',
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof NotFound>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Off the beaten path');
  },
};
