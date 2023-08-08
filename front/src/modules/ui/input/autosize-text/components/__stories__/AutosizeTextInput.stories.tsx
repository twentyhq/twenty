import type { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import {
  AutosizeTextInput,
  AutosizeTextInputVariant,
} from '../AutosizeTextInput';

const meta: Meta<typeof AutosizeTextInput> = {
  title: 'UI/Input/AutosizeTextInput',
  component: AutosizeTextInput,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof AutosizeTextInput>;

export const Default: Story = {};

export const ButtonVariant: Story = {
  args: { variant: AutosizeTextInputVariant.Button },
};
