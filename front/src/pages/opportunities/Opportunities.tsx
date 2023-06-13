import { FaBullseye } from 'react-icons/fa';

import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import { AppPage } from '~/AppPage';

import { useGetPipelinesQuery } from '../../generated/graphql';
import { items } from '../../modules/opportunities/components/__stories__/mock-data';
import { Board } from '../../modules/opportunities/components/Board';
import { Column } from '../../modules/ui/components/board/Board';

export function Opportunities() {
  const pipelines = useGetPipelinesQuery();
  const initialBoard: Column[] =
    pipelines.data?.findManyPipeline[0].pipelineStages?.map(
      (pipelineStage) => ({
        id: pipelineStage.name,
        title: pipelineStage.name,
        colorCode: pipelineStage.color,
        itemKeys: [],
      }),
    ) || [];

  if (pipelines.loading) return <div>Loading...</div>;
  if (pipelines.error) return <div>Error...</div>;
  return (
    <AppPage>
      <WithTopBarContainer title="Opportunities" icon={<FaBullseye />}>
        <Board initialBoard={initialBoard} items={items} />
      </WithTopBarContainer>
    </AppPage>
  );
}
