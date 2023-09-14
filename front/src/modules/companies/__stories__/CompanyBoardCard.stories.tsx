import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';

import { CompanyBoardCard } from '@/companies/components/CompanyBoardCard';
import { pipelineAvailableFieldDefinitions } from '@/pipeline/constants/pipelineAvailableFieldDefinitions';
import { BoardCardIdContext } from '@/ui/board/contexts/BoardCardIdContext';
import { boardCardFieldsScopedState } from '@/ui/board/states/boardCardFieldsScopedState';
import { BoardColumnRecoilScopeContext } from '@/ui/board/states/recoil-scope-contexts/BoardColumnRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedPipelineProgressData } from '~/testing/mock-data/pipeline-progress';

import { HooksCompanyBoard } from '../components/HooksCompanyBoard';
import { CompanyBoardRecoilScopeContext } from '../states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';

const meta: Meta<typeof CompanyBoardCard> = {
  title: 'Modules/Companies/CompanyBoardCard',
  component: CompanyBoardCard,
  decorators: [
    (Story, context) => {
      const [, setBoardCardFields] = useRecoilScopedState(
        boardCardFieldsScopedState,
        context.parameters.recoilScopeContext,
      );

      useEffect(() => {
        setBoardCardFields(pipelineAvailableFieldDefinitions);
      }, [setBoardCardFields]);

      return (
        <>
          <HooksCompanyBoard />
          <RecoilScope SpecificContext={BoardColumnRecoilScopeContext}>
            <BoardCardIdContext.Provider
              value={mockedPipelineProgressData[1].id}
            >
              <MemoryRouter>
                <Story />
              </MemoryRouter>
            </BoardCardIdContext.Provider>
          </RecoilScope>
        </>
      );
    },
    ComponentWithRecoilScopeDecorator,
    ComponentDecorator,
  ],
  args: { scopeContext: CompanyBoardRecoilScopeContext },
  argTypes: { scopeContext: { control: false } },
  parameters: {
    msw: graphqlMocks,
    recoilScopeContext: CompanyBoardRecoilScopeContext,
  },
};

export default meta;
type Story = StoryObj<typeof CompanyBoardCard>;

export const Default: Story = {};
