import { Meta, StoryObj } from '@storybook/react';

import { Card } from '../Card';

const meta: Meta<typeof Card> = {
  title: 'UI/Layout/Card/Card',
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {};
