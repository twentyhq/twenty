import { useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import { Decorator } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { HooksCompanyBoard } from '@/companies/components/HooksCompanyBoard';
import { CompanyBoardContext } from '@/companies/states/CompanyBoardContext';
import { defaultPipelineProgressOrderBy } from '@/pipeline/queries';
import { BoardCardContext } from '@/pipeline/states/BoardCardContext';
import { BoardColumnContext } from '@/pipeline/states/BoardColumnContext';
import { pipelineProgressIdScopedState } from '@/pipeline/states/pipelineProgressIdScopedState';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';
import { CellContext } from '@/ui/table/states/CellContext';
import { RowContext } from '@/ui/table/states/RowContext';

import { mockedPipelineProgressData } from './mock-data/pipeline-progress';
import { ComponentStorybookLayout } from './ComponentStorybookLayout';
import { mockedClient } from './mockedClient';

export const RootDecorator: Decorator = (Story) => (
  <RecoilRoot>
    <ApolloProvider client={mockedClient}>
      <Story />
    </ApolloProvider>
  </RecoilRoot>
);

export const ComponentDecorator: Decorator = (Story) => (
  <ComponentStorybookLayout>
    <Story />
  </ComponentStorybookLayout>
);

export const CellPositionDecorator: Decorator = (Story) => (
  <RecoilScope SpecificContext={RowContext}>
    <RecoilScope SpecificContext={CellContext}>
      <Story />
    </RecoilScope>
  </RecoilScope>
);

export const BoardDecorator: Decorator = (Story) => (
  <>
    <RecoilScope SpecificContext={CompanyBoardContext}>
      <HooksCompanyBoard
        availableFilters={[]}
        orderBy={defaultPipelineProgressOrderBy}
      />
      <Story />
    </RecoilScope>
  </>
);

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

export const BoardCardDecorator: Decorator = (Story) => {
  return (
    <>
      <RecoilScope SpecificContext={CompanyBoardContext}>
        <HooksCompanyBoard
          availableFilters={[]}
          orderBy={defaultPipelineProgressOrderBy}
        />
        <RecoilScope SpecificContext={BoardColumnContext}>
          <RecoilScope SpecificContext={BoardCardContext}>
            <HookLoadFakeBoardContextState />
            <Story />
          </RecoilScope>
        </RecoilScope>
      </RecoilScope>
    </>
  );
};
