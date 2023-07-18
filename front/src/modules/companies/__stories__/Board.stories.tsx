import { Meta, StoryObj } from '@storybook/react';

import { EntityBoard } from '@/pipeline/components/EntityBoard';
import { opportunitiesBoardOptions } from '~/pages/opportunities/opportunitiesBoardOptions';
import { BoardDecorator } from '~/testing/decorators';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

const meta: Meta<typeof EntityBoard> = {
  title: 'Modules/Companies/Board',
  component: EntityBoard,
  decorators: [BoardDecorator],
};

export default meta;
type Story = StoryObj<typeof EntityBoard>;

export const OneColumnBoard: Story = {
  render: getRenderWrapperForComponent(
    <EntityBoard
      boardOptions={opportunitiesBoardOptions}
      updateSorts={() => {
        return;
      }}
    />,
  ),
  parameters: {
    msw: graphqlMocks,
  },
};
