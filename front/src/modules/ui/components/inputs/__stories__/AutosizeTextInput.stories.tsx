import type { Meta, StoryObj } from '@storybook/react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { AutosizeTextInput } from '../AutosizeTextInput';

const meta: Meta<typeof AutosizeTextInput> = {
  title: 'Components/Common/AutosizeTextInput',
  component: AutosizeTextInput,
  argTypes: {
    onSend: {
      action: 'onSend',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AutosizeTextInput>;

export const Default: Story = {
  render: getRenderWrapperForComponent(<AutosizeTextInput />),
};
