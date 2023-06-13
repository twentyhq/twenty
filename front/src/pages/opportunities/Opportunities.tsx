import { FaBullseye } from 'react-icons/fa';

import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import { AppPage } from '~/AppPage';

import {
  useGetPeopleQuery,
  useGetPipelinesQuery,
} from '../../generated/graphql';
import { Board } from '../../modules/opportunities/components/Board';
import {
  BoardItemKey,
  Column,
  Items,
} from '../../modules/ui/components/board/Board';

export function Opportunities() {
  const pipelines = useGetPipelinesQuery();
  const initialBoard: Column[] =
    pipelines.data?.findManyPipeline[0].pipelineStages?.map(
      (pipelineStage) => ({
        id: pipelineStage.name,
        title: pipelineStage.name,
        colorCode: pipelineStage.color,
        itemKeys:
          pipelineStage.pipelineProgresses?.map(
            (item) => `item-${item.associableId}` as BoardItemKey,
          ) || [],
      }),
    ) || [];

  const pipelineEntityIds =
    pipelines.data?.findManyPipeline[0].pipelineStages?.reduce(
      (acc, pipelineStage) => [
        ...acc,
        ...(pipelineStage.pipelineProgresses?.map(
          (item) => item.associableId,
        ) || []),
      ],
      [] as string[],
    );
  const persons = useGetPeopleQuery({
    variables: { where: { id: { in: pipelineEntityIds } } },
  });

  const items: Items =
    persons.data?.people.reduce(
      (acc, person) => ({ ...acc, [`item-${person.id}`]: person }),
      {},
    ) || {};

  if (pipelines.loading || persons.loading) return <div>Loading...</div>;
  if (pipelines.error || persons.error) return <div>Error...</div>;
  return (
    <AppPage>
      <WithTopBarContainer title="Opportunities" icon={<FaBullseye />}>
        <Board initialBoard={initialBoard} items={items} />
      </WithTopBarContainer>
    </AppPage>
  );
}
