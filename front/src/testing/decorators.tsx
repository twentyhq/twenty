import { useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import { Decorator } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { pipeline } from '@/companies/__stories__/mock-data';
import { CompanyBoardContext } from '@/companies/states/CompanyBoardContext';
import { BoardCardContext } from '@/pipeline-progress/states/BoardCardContext';
import { BoardColumnContext } from '@/pipeline-progress/states/BoardColumnContext';
import { pipelineProgressIdScopedState } from '@/pipeline-progress/states/pipelineProgressIdScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { HookCompanyBoard } from '~/pages/opportunities/HookCompanyBoard';

import { RecoilScope } from '../modules/recoil-scope/components/RecoilScope';
import { CellContext } from '../modules/ui/tables/states/CellContext';
import { RowContext } from '../modules/ui/tables/states/RowContext';

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
    <HookCompanyBoard />
    <RecoilScope SpecificContext={CompanyBoardContext}>
      <Story />
    </RecoilScope>
  </>
);

function HookLoadFakeBoardContextState() {
  const [, setPipelineProgressId] = useRecoilScopedState(
    pipelineProgressIdScopedState,
    BoardCardContext,
  );
  const pipelineProgress =
    pipeline?.pipelineStages?.[0]?.pipelineProgresses?.[0];
  useEffect(() => {
    setPipelineProgressId(pipelineProgress?.id || '');
  }, [pipelineProgress?.id, setPipelineProgressId]);
  return <></>;
}

export const BoardCardDecorator: Decorator = (Story) => {
  return (
    <>
      <HookCompanyBoard />
      <RecoilScope SpecificContext={CompanyBoardContext}>
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
