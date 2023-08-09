import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';

import { CompanyBoardCard } from '@/companies/components/CompanyBoardCard';
import { BoardCardIdContext } from '@/ui/board/states/BoardCardIdContext';
import { BoardColumnContext } from '@/ui/board/states/BoardColumnContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedPipelineProgressData } from '~/testing/mock-data/pipeline-progress';

import { defaultPipelineProgressOrderBy } from '../../pipeline/queries';
import { HooksCompanyBoard } from '../components/HooksCompanyBoard';
import { CompanyBoardContext } from '../states/CompanyBoardContext';

const meta: Meta<typeof CompanyBoardCard> = {
  title: 'Modules/Companies/CompanyBoardCard',
  component: CompanyBoardCard,
  decorators: [
    (Story) => (
      <RecoilScope SpecificContext={CompanyBoardContext}>
        <HooksCompanyBoard orderBy={defaultPipelineProgressOrderBy} />
        <RecoilScope SpecificContext={BoardColumnContext}>
          <BoardCardIdContext.Provider value={mockedPipelineProgressData[1].id}>
            <MemoryRouter>
              <Story />
            </MemoryRouter>
          </BoardCardIdContext.Provider>
        </RecoilScope>
      </RecoilScope>
    ),
    ComponentDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof CompanyBoardCard>;

export const CompanyCompanyBoardCard: Story = {};
