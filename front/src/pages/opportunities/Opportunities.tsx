import { useTheme } from '@emotion/react';

import { CompanyBoardContext } from '@/companies/components/CompanyBoard/CompanyBoardContext';
import { CompanyProgressBoard } from '@/companies/components/CompanyBoard/CompanyProgressBoard';
import { BoardActionBarButtonDeletePipelineProgress } from '@/pipeline-progress/components/BoardActionBarButtonDeletePipelineProgress';
import { EntityBoardActionBar } from '@/pipeline-progress/components/EntityBoardActionBar';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { IconTargetArrow } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';

import { useGetPipelinesQuery } from '../../generated/graphql';

export function Opportunities() {
  const theme = useTheme();

  const pipelines = useGetPipelinesQuery();
  const pipelineId = pipelines.data?.findManyPipeline[0]?.id;

  return (
    <WithTopBarContainer
      title="Opportunities"
      icon={<IconTargetArrow size={theme.icon.size.md} />}
    >
      {pipelineId ? (
        <RecoilScope SpecificContext={CompanyBoardContext}>
          <CompanyProgressBoard pipelineId={pipelineId} />
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
