import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { AppPath } from '@/types/AppPath';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

import { CreateWorkspace } from '../CreateWorkspace';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Auth/CreateWorkspace',
  component: CreateWorkspace,
  decorators: [PageDecorator],
  args: { routePath: AppPath.CreateWorkspace },
  parameters: {
    msw: [],
  },
};

export default meta;

export type Story = StoryObj<typeof CreateWorkspace>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Create your workspace');
  },
};
