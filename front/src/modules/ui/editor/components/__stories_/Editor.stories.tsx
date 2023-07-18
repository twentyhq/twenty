import type { Meta, StoryObj } from '@storybook/react';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { Editor } from '../Editor';

const meta: Meta<typeof Editor> = {
  title: 'UI/Editor/Editor',
  component: Editor,
};

export default meta;
type Story = StoryObj<typeof Editor>;

export const Default: Story = {
  render: getRenderWrapperForComponent(<Editor />),
  parameters: {
    msw: graphqlMocks,
  },
};
