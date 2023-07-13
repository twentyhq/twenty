import { useTheme } from '@emotion/react';

import { CompanyBoardContext } from '@/companies/components/CompanyBoard/CompanyBoardContext';
import { CompanyProgressBoard } from '@/companies/components/CompanyBoard/CompanyProgressBoard';
import { BoardActionBarButtonDeletePipelineProgress } from '@/pipeline-progress/components/BoardActionBarButtonDeletePipelineProgress';
import { EntityBoardActionBar } from '@/pipeline-progress/components/EntityBoardActionBar';
import { useBoard } from '@/pipeline-progress/hooks/useBoard';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { IconTargetArrow } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';

import {
  useGetCompaniesQuery,
  useGetPipelinesQuery,
} from '../../generated/graphql';

export function Opportunities() {
  const theme = useTheme();

  const pipelines = useGetPipelinesQuery();
  const pipelineId = pipelines.data?.findManyPipeline[0]?.id;

  const { initialBoard, items } = useBoard(
    pipelineId || '',
    useGetCompaniesQuery,
  );

  return (
    <WithTopBarContainer
      title="Opportunities"
      icon={<IconTargetArrow size={theme.icon.size.md} />}
    >
      {items && pipelineId ? (
        <RecoilScope SpecificContext={CompanyBoardContext}>
          <CompanyProgressBoard
            pipelineId={pipelineId}
            initialBoard={initialBoard}
            initialItems={items}
          />
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
