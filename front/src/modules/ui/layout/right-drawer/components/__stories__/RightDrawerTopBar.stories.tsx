import type { Meta, StoryObj } from '@storybook/react';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { RightDrawerTopBar } from '../RightDrawerTopBar';

const meta: Meta<typeof RightDrawerTopBar> = {
  title: 'Components/RightDrawer/RightDrawerTopBar',
  component: RightDrawerTopBar,
  argTypes: {
    title: {
      control: { type: 'text' },
      defaultValue: 'My Title',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RightDrawerTopBar>;

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <div style={{ width: '500px' }}>
      <RightDrawerTopBar title={'Title'} />
    </div>,
  ),
  parameters: {
    msw: graphqlMocks,
    actions: { argTypesRegex: '^on.*' },
  },
  args: {},
};
