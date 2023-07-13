import { useTheme } from '@emotion/react';

import { CompanyProgressBoard } from '@/companies/components/CompanyProgressBoard';
import { CompanyBoardContext } from '@/companies/states/CompanyBoardContext';
import { BoardActionBarButtonDeletePipelineProgress } from '@/pipeline-progress/components/BoardActionBarButtonDeletePipelineProgress';
import { EntityBoardActionBar } from '@/pipeline-progress/components/EntityBoardActionBar';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { IconTargetArrow } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';

import { Pipeline, useGetPipelinesQuery } from '../../generated/graphql';

export function Opportunities() {
  const theme = useTheme();

  const pipelines = useGetPipelinesQuery();
  const pipeline = pipelines.data?.findManyPipeline[0] as Pipeline | undefined;

  return (
    <WithTopBarContainer
      title="Opportunities"
      icon={<IconTargetArrow size={theme.icon.size.md} />}
    >
      {pipeline ? (
        <RecoilScope SpecificContext={CompanyBoardContext}>
          <CompanyProgressBoard pipeline={pipeline} />
          <EntityBoardActionBar>
            <BoardActionBarButtonDeletePipelineProgress />
          </EntityBoardActionBar>
        </RecoilScope>
      ) : (
        <></>
      )}
    </WithTopBarContainer>
  );
}
