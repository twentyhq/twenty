import type { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators';

import { AutosizeTextInput } from '../AutosizeTextInput';

const meta: Meta<typeof AutosizeTextInput> = {
  title: 'UI/Inputs/AutosizeTextInput',
  component: AutosizeTextInput,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof AutosizeTextInput>;

export const Default: Story = {};
