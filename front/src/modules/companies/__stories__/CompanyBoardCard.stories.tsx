import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';

import { CompanyBoardCard } from '@/companies/components/CompanyBoardCard';
import { BoardCardIdContext } from '@/ui/board/contexts/BoardCardIdContext';
import { BoardColumnRecoilScopeContext } from '@/ui/board/states/recoil-scope-contexts/BoardColumnRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedPipelineProgressData } from '~/testing/mock-data/pipeline-progress';

import { HooksCompanyBoard } from '../components/HooksCompanyBoard';
import { CompanyBoardRecoilScopeContext } from '../states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';

const meta: Meta<typeof CompanyBoardCard> = {
  title: 'Modules/Companies/CompanyBoardCard',
  component: CompanyBoardCard,
  decorators: [
    (Story) => (
      <RecoilScope SpecificContext={CompanyBoardRecoilScopeContext}>
        <HooksCompanyBoard />
        <RecoilScope SpecificContext={BoardColumnRecoilScopeContext}>
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
