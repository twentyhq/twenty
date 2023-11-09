import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';

import { CompanyBoardCard } from '@/companies/components/CompanyBoardCard';
import { pipelineAvailableFieldDefinitions } from '@/pipeline/constants/pipelineAvailableFieldDefinitions';
import { BoardCardIdContext } from '@/ui/layout/board/contexts/BoardCardIdContext';
import { boardCardFieldsScopedState } from '@/ui/layout/board/states/boardCardFieldsScopedState';
import { BoardColumnRecoilScopeContext } from '@/ui/layout/board/states/recoil-scope-contexts/BoardColumnRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { ViewScope } from '@/views/scopes/ViewScope';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedPipelineProgressData } from '~/testing/mock-data/pipeline-progress';

import { HooksCompanyBoardEffect } from '../components/HooksCompanyBoardEffect';
import { BoardContext } from '../states/contexts/BoardContext';
import { CompanyBoardRecoilScopeContext } from '../states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';

const meta: Meta<typeof CompanyBoardCard> = {
  title: 'Modules/Companies/CompanyBoardCard',
  component: CompanyBoardCard,
  decorators: [
    (Story, context) => {
      const [, setBoardCardFields] = useRecoilScopedState(
        boardCardFieldsScopedState,
        context.parameters.customRecoilScopeContext,
      );

      useEffect(() => {
        setBoardCardFields(pipelineAvailableFieldDefinitions);
      }, [setBoardCardFields]);

      return (
        <MemoryRouter>
          <ViewScope viewScopeId="company-board-view">
            <RecoilScope
              CustomRecoilScopeContext={BoardColumnRecoilScopeContext}
            >
              <BoardContext.Provider
                value={{
                  BoardRecoilScopeContext:
                    context.parameters.customRecoilScopeContext,
                }}
              >
                <HooksCompanyBoardEffect />
                <BoardCardIdContext.Provider
                  value={mockedPipelineProgressData[1].id}
                >
                  <Story />
                </BoardCardIdContext.Provider>
              </BoardContext.Provider>
            </RecoilScope>
          </ViewScope>
        </MemoryRouter>
      );
    },
    ComponentWithRecoilScopeDecorator,
    ComponentDecorator,
  ],
  args: {},
  argTypes: {},
  parameters: {
    msw: graphqlMocks,
    customRecoilScopeContext: CompanyBoardRecoilScopeContext,
  },
};

export default meta;
type Story = StoryObj<typeof CompanyBoardCard>;

export const Default: Story = {};
