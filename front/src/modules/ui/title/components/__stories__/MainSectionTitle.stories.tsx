import type { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { MainSectionTitle } from '../MainSectionTitle';


const meta: Meta<typeof MainSectionTitle> = {
  title: 'UI/Title/MainSectionTitle',
  component: MainSectionTitle,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof MainSectionTitle>;

const args = {
  children: 'Lorem ipsum',
};

export const Default: Story = {
  args,
  decorators: [ComponentDecorator],
};
