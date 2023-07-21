import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';

import { EntityBoard } from '@/pipeline/components/EntityBoard';
import { opportunitiesBoardOptions } from '~/pages/opportunities/opportunitiesBoardOptions';
import { ComponentDecorator } from '~/testing/decorators';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { defaultPipelineProgressOrderBy } from '../../pipeline/queries';
import { RecoilScope } from '../../ui/recoil-scope/components/RecoilScope';
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
