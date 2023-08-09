import { Pipeline } from '~/generated/graphql';

export const pipeline = {
  id: 'pipeline-1',
  name: 'pipeline-1',
  pipelineStages: [
    {
      id: 'pipeline-stage-1',
      name: 'New',
      index: 0,
      color: 'red',
    },
    {
      id: 'pipeline-stage-2',
      name: 'Screening',
      index: 1,
      color: 'purple',
    },
    {
      id: 'pipeline-stage-3',
      name: 'Meeting',
      index: 2,
      color: 'sky',
    },
    {
      id: 'pipeline-stage-4',
      name: 'Proposal',
      index: 3,
      color: 'turquoise',
    },
    {
      id: 'pipeline-stage-5',
      name: 'Customer',
      index: 4,
      color: 'yellow',
    },
  ],
} as Pipeline;
