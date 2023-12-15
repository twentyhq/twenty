import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { AppPath } from '@/types/AppPath';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

import { CreateProfile } from '../CreateProfile';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Auth/CreateProfile',
  component: CreateProfile,
  decorators: [PageDecorator],
  args: { routePath: AppPath.CreateProfile },
  parameters: {},
};

export default meta;

export type Story = StoryObj<typeof CreateProfile>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Create profile');
  },
};
