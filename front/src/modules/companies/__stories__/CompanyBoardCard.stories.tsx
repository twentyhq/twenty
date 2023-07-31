import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';

import { CompanyBoardCard } from '@/companies/components/CompanyBoardCard';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedPipelineProgressData } from '~/testing/mock-data/pipeline-progress';

import { defaultPipelineProgressOrderBy } from '../../pipeline/queries';
import { BoardCardContext } from '../../pipeline/states/BoardCardContext';
import { BoardColumnContext } from '../../pipeline/states/BoardColumnContext';
import { pipelineProgressIdScopedState } from '../../pipeline/states/pipelineProgressIdScopedState';
import { HooksCompanyBoard } from '../components/HooksCompanyBoard';
import { CompanyBoardContext } from '../states/CompanyBoardContext';

function HookLoadFakeBoardContextState() {
  const [, setPipelineProgressId] = useRecoilScopedState(
    pipelineProgressIdScopedState,
    BoardCardContext,
  );
  const pipelineProgress = mockedPipelineProgressData[1];
  useEffect(() => {
    setPipelineProgressId(pipelineProgress?.id || '');
  }, [pipelineProgress?.id, setPipelineProgressId]);
  return <></>;
}

const meta: Meta<typeof CompanyBoardCard> = {
  title: 'Modules/Companies/CompanyBoardCard',
  component: CompanyBoardCard,
  decorators: [
    (Story) => (
      <RecoilScope SpecificContext={CompanyBoardContext}>
        <HooksCompanyBoard
          availableFilters={[]}
          orderBy={defaultPipelineProgressOrderBy}
        />
        <RecoilScope SpecificContext={BoardColumnContext}>
          <RecoilScope SpecificContext={BoardCardContext}>
            <HookLoadFakeBoardContextState />
            <MemoryRouter>
              <Story />
            </MemoryRouter>
          </RecoilScope>
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
