import { Meta, StoryObj } from '@storybook/react';

import { companyBoardOptions } from '@/companies/components/companyBoardOptions';
import { EntityBoard } from '@/pipeline/components/EntityBoard';
import { availableSorts } from '~/pages/opportunities/opportunities-sorts';
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
      boardOptions={companyBoardOptions}
      availableSorts={availableSorts}
      updateSorts={() => {
        return;
      }}
    />,
  ),
  parameters: {
    msw: graphqlMocks,
  },
};
