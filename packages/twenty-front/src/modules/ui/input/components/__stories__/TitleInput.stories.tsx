import { type Meta, type StoryObj } from '@storybook/react';

import { TitleInput } from '@/ui/input/components/TitleInput';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof TitleInput> = {
  title: 'UI/Input/TitleInput',
  component: TitleInput,
  decorators: [ComponentDecorator],
  args: {
    placeholder: 'Enter title',
    sizeVariant: 'md',
  },
  argTypes: {
    sizeVariant: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof TitleInput>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: 'Sample Title' },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'Disabled Title' },
};

export const ExtraSmall: Story = {
  args: { sizeVariant: 'xs', value: 'Extra Small Title' },
};

export const Small: Story = {
  args: { sizeVariant: 'sm', value: 'Small Title' },
};

export const Medium: Story = {
  args: { sizeVariant: 'md', value: 'Medium Title' },
};

export const Large: Story = {
  args: { sizeVariant: 'lg', value: 'Large Title' },
};

export const WithLongText: Story = {
  args: {
    value:
      'This is a very long title that will likely overflow and demonstrate the tooltip behavior of the component',
  },
  parameters: {
    container: {
      width: 250,
    },
  },
};

export const WithCustomPlaceholder: Story = {
  args: { placeholder: 'Custom placeholder example' },
};
