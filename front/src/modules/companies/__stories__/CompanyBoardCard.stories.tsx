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

import { HooksCompanyBoardEffect } from '../components/HooksCompanyBoardEffect';
import { BoardContext } from '../states/contexts/BoardContext';

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
          <HooksCompanyBoardEffect />
          <RecoilScope SpecificContext={BoardColumnRecoilScopeContext}>
            <BoardCardIdContext.Provider
              value={mockedPipelineProgressData[1].id}
            >
              <BoardContext.Provider
                value={{
                  BoardRecoilScopeContext: BoardColumnRecoilScopeContext,
                }}
              >
                <MemoryRouter>
                  <Story />
                </MemoryRouter>
              </BoardContext.Provider>
            </BoardCardIdContext.Provider>
          </RecoilScope>
        </>
      );
    },
    ComponentWithRecoilScopeDecorator,
    ComponentDecorator,
  ],
  args: {},
  argTypes: {},
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof CompanyBoardCard>;

export const Default: Story = {};
