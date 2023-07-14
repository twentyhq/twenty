import { Meta, StoryObj } from '@storybook/react';

import { companyBoardOptions } from '@/pipeline-progress/components/companyBoardOptions';
import { EntityProgressBoard } from '@/pipeline-progress/components/EntityProgressBoard';
import { Entity } from '@/relation-picker/types/EntityTypeForSelect';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { pipeline } from './mock-data';

const meta: Meta<typeof EntityProgressBoard> = {
  title: 'UI/Board/Board',
  component: EntityProgressBoard,
};

export default meta;
type Story = StoryObj<typeof EntityProgressBoard>;

export const OneColumnBoard: Story = {
  render: getRenderWrapperForComponent(
    <EntityProgressBoard boardOptions={companyBoardOptions} />,
  ),
  parameters: {
    msw: graphqlMocks,
  },
};
