import type { Meta, StoryObj } from '@storybook/react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { AutosizeTextInput } from '../AutosizeTextInput';

const meta: Meta<typeof AutosizeTextInput> = {
  title: 'UI/Inputs/AutosizeTextInput',
  component: AutosizeTextInput,
};

export default meta;
type Story = StoryObj<typeof AutosizeTextInput>;

export const Default: Story = {
  render: getRenderWrapperForComponent(<AutosizeTextInput />),
};
