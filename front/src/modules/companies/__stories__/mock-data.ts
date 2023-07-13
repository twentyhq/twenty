import { Pipeline } from '~/generated/graphql';
import { mockedCompaniesData } from '~/testing/mock-data/companies';

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
        {
          id: '0',
          amount: 1,
          progressableId: mockedCompaniesData[0].id,
        },
        {
          id: '1',
          amount: 1,
          progressableId: mockedCompaniesData[1].id,
        },
        {
          id: '2',
          amount: 1,
          progressableId: mockedCompaniesData[2].id,
        },
        {
          id: '3',
          amount: 1,
          progressableId: mockedCompaniesData[3].id,
        },
      ],
    },
  ],
} as Pipeline;
