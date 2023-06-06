import type { Meta, StoryObj } from '@storybook/react';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { CommentTextInput } from '../CommentTextInput';

const meta: Meta<typeof CommentTextInput> = {
  title: 'Components/Comments/CommentTextInput',
  component: CommentTextInput,
  argTypes: {
    onSend: {
      action: 'onSend',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CommentTextInput>;

export const Default: Story = {
  render: getRenderWrapperForComponent(<CommentTextInput />),
  parameters: {
    msw: graphqlMocks,
    actions: { argTypesRegex: '^on.*' },
  },
  args: {
    onSend: (text: string) => {
      console.log(text);
    },
  },
};
