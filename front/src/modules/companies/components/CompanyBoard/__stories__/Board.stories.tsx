import { Meta, StoryObj } from '@storybook/react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { CompanyProgressBoard } from '../CompanyProgressBoard';

const meta: Meta<typeof CompanyProgressBoard> = {
  title: 'UI/Board/Board',
  component: CompanyProgressBoard,
};

export default meta;
type Story = StoryObj<typeof CompanyProgressBoard>;

export const OneColumnBoard: Story = {
  render: getRenderWrapperForComponent(<p>Hello World</p>),
};
