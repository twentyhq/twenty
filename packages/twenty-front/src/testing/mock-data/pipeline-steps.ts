import { PipelineStep } from '@/pipeline/types/PipelineStep';

const dates = {
  updatedAt: '2021-06-01T10:23:42.33625+00:00',
  createdAt: '2021-06-01T10:23:42.33625+00:00',
};

export const mockedPipelineSteps: Array<PipelineStep> = [
  {
    id: '6edf4ead-006a-46e1-9c6d-228f1d0143c9',
    color: 'red',
    name: 'New',
    position: 0,
    ...dates,
  },
  {
    id: '30b14887-d592-427d-bd97-6e670158db02',
    color: 'sky',
    name: 'Meeting',
    position: 2,
    ...dates,
  },
  {
    id: 'bea8bb7b-5467-48a6-9a8a-a8fa500123fe',

    color: 'yellow',
    name: 'Customer',
    position: 4,
    ...dates,
  },
  {
    id: 'd8361722-03fb-4e65-bd4f-ec9e52e5ec0a',
    color: 'purple',
    name: 'Screening',
    position: 1,
    ...dates,
  },
  {
    id: 'db5a6648-d80d-4020-af64-4817ab4a12e8',
    color: 'turquoise',
    name: 'Proposal',
    position: 3,
    ...dates,
  },
];
