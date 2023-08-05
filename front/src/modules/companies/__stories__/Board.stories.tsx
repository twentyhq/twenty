import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';

import { EntityBoard } from '@/ui/board/components/EntityBoard';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { opportunitiesBoardOptions } from '~/pages/opportunities/opportunitiesBoardOptions';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { defaultPipelineProgressOrderBy } from '../../pipeline/queries';
import { HooksCompanyBoard } from '../components/HooksCompanyBoard';
import { CompanyBoardContext } from '../states/CompanyBoardContext';

const meta: Meta<typeof EntityBoard> = {
  title: 'Modules/Companies/Board',
  component: EntityBoard,
  decorators: [
    (Story) => (
      <RecoilScope SpecificContext={CompanyBoardContext}>
        <HooksCompanyBoard
          availableFilters={[]}
          orderBy={defaultPipelineProgressOrderBy}
        />
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </RecoilScope>
    ),
    ComponentDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof EntityBoard>;

export const OneColumnBoard: Story = {
  render: (args) => (
    <EntityBoard {...args} boardOptions={opportunitiesBoardOptions} />
  ),
};
