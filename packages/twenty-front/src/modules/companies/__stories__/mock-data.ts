import { PipelineStep } from '@/pipeline/types/PipelineStep';

export const pipelineSteps = [
  {
    id: 'pipeline-stage-1',
    name: 'New',
    position: 0,
    color: 'red',
  },
  {
    id: 'pipeline-stage-2',
    name: 'Screening',
    position: 1,
    color: 'purple',
  },
  {
    id: 'pipeline-stage-3',
    name: 'Meeting',
    position: 2,
    color: 'sky',
  },
  {
    id: 'pipeline-stage-4',
    name: 'Proposal',
    position: 3,
    color: 'turquoise',
  },
  {
    id: 'pipeline-stage-5',
    name: 'Customer',
    position: 4,
    color: 'yellow',
  },
] as PipelineStep[];
