import type { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { SubSectionTitle } from '../SubSectionTitle';

const args = {
  title: 'Lorem ipsum',
  description: 'Lorem ipsum dolor sit amet',
};

const meta: Meta<typeof SubSectionTitle> = {
  title: 'UI/Title/SubSectionTitle',
  component: SubSectionTitle,
  decorators: [ComponentDecorator],
  args: {
    title: args.title,
  },
};

export default meta;

type Story = StoryObj<typeof SubSectionTitle>;

export const Default: Story = {
  decorators: [ComponentDecorator],
};

export const WithDescription: Story = {
  args,
  decorators: [ComponentDecorator],
};
