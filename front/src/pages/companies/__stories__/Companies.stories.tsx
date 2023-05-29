import type { Meta, StoryObj } from '@storybook/react';

import Companies from '../Companies';

import { render, mocks } from './shared';

const meta: Meta<typeof Companies> = {
  title: 'Pages/Companies',
  component: Companies,
};

export default meta;

export type Story = StoryObj<typeof Companies>;

export const Default: Story = {
  render,
  parameters: {
    msw: mocks,
  },
};
