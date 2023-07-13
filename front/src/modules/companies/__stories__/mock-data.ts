import { Pipeline } from '~/generated/graphql';

export const pipeline = {
  id: 'pipeline-1',
  name: 'pipeline-1',
  pipelineStages: [
    {
      id: 'pipeline-stage-1',
      name: 'New',
      index: 0,
      color: '#B76796',
      pipelineProgresses: [
        { id: 'fe256b39-3ec3-4fe7-8998-b76aa0bfb600' },
        { id: '4a886c90-f4f2-4984-8222-882ebbb905d6' },
      ],
    },
    {
      id: 'pipeline-stage-2',
      name: 'Screening',
      index: 1,
      color: '#CB912F',
    },
    {
      id: 'pipeline-stage-3',
      name: 'Meeting',
      index: 2,
      color: '#9065B0',
    },
    {
      id: 'pipeline-stage-4',
      name: 'Proposal',
      index: 3,
      color: '#337EA9',
    },
    {
      id: 'pipeline-stage-5',
      name: 'Customer',
      index: 4,
      color: '#079039',
    },
  ],
} as Pipeline;
