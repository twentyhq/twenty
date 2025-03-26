import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { TitleInput } from '@/ui/input/components/TitleInput';

const meta: Meta<typeof TitleInput> = {
  title: 'UI/Input/TitleInput',
  component: TitleInput,
  decorators: [ComponentDecorator],
  args: {
    placeholder: 'Enter title',
    hotkeyScope: 'titleInput',
    sizeVariant: 'md',
  },
  argTypes: {
    hotkeyScope: { control: false },
    sizeVariant: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof TitleInput>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { draftValue: 'Sample Title' },
};

export const Disabled: Story = {
  args: { disabled: true, draftValue: 'Disabled Title' },
};

export const ExtraSmall: Story = {
  args: { sizeVariant: 'xs', draftValue: 'Extra Small Title' },
};

export const Small: Story = {
  args: { sizeVariant: 'sm', draftValue: 'Small Title' },
};

export const Medium: Story = {
  args: { sizeVariant: 'md', draftValue: 'Medium Title' },
};

export const Large: Story = {
  args: { sizeVariant: 'lg', draftValue: 'Large Title' },
};

export const WithLongText: Story = {
  args: {
    draftValue:
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
