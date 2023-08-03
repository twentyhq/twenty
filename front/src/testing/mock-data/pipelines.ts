import {
  Pipeline,
  PipelineProgress,
  PipelineProgressableType,
  PipelineStage,
} from '../../generated/graphql';

type MockedPipeline = Pick<
  Pipeline,
  'id' | 'name' | 'pipelineProgressableType' | '__typename'
> & {
  pipelineStages: Array<
    Pick<PipelineStage, 'id' | 'name' | 'color' | 'index' | '__typename'> & {
      pipelineProgresses: Array<
        Pick<
          PipelineProgress,
          | 'id'
          | 'progressableType'
          | 'companyId'
          | 'amount'
          | 'closeDate'
          | '__typename'
        >
      >;
    }
  >;
};

export const mockedPipelinesData: Array<MockedPipeline> = [
  {
    id: 'fe256b39-3ec3-4fe3-8997-b75aa0bfb400',
    name: 'Sales pipeline',
    pipelineProgressableType: PipelineProgressableType.Company,
    pipelineStages: [
      {
        id: 'fe256b39-3ec3-4fe3-8998-b76aa0bfb600',
        name: 'New',
        color: '#B76796',
        index: 0,
        pipelineProgresses: [
          {
            id: 'fe256b39-3ec3-4fe7-8998-b76aa0bfb600',
            progressableType: PipelineProgressableType.Company,
            companyId: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
            amount: null,
            closeDate: null,
            __typename: 'PipelineProgress',
          },
          {
            id: '4a886c90-f4f2-4984-8222-882ebbb905d6',
            progressableType: PipelineProgressableType.Company,
            companyId: 'b396e6b9-dc5c-4643-bcff-61b6cf7523ae',
            amount: null,
            closeDate: null,
            __typename: 'PipelineProgress',
          },
        ],
        __typename: 'PipelineStage',
      },
      {
        id: 'fe256b39-3ec3-4fe4-8998-b76aa0bfb600',
        name: 'Screening',
        color: '#CB912F',
        index: 1,
        pipelineProgresses: [],
        __typename: 'PipelineStage',
      },
      {
        id: 'fe256b39-3ec3-4fe5-8998-b76aa0bfb600',
        name: 'Meeting',
        color: '#9065B0',
        index: 2,
        pipelineProgresses: [],
        __typename: 'PipelineStage',
      },
      {
        id: 'fe256b39-3ec3-4fe6-8998-b76aa0bfb600',
        name: 'Proposal',
        color: '#337EA9',
        index: 3,
        pipelineProgresses: [],
        __typename: 'PipelineStage',
      },
      {
        id: 'fe256b39-3ec3-4fe7-8998-b76aa0bfb600',
        name: 'Customer',
        color: '#079039',
        index: 4,
        pipelineProgresses: [],
        __typename: 'PipelineStage',
      },
    ],
    __typename: 'Pipeline',
  },
];
