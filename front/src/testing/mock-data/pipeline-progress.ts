import {
  PipelineProgress,
  PipelineProgressableType,
  User,
} from '../../generated/graphql';

type MockedPipelineProgress = Pick<
  PipelineProgress,
  | 'id'
  | 'amount'
  | 'closeDate'
  | 'companyId'
  | 'pipelineStageId'
  | 'progressableType'
> & {
  accountOwner: Pick<
    User,
    | 'id'
    | 'email'
    | 'displayName'
    | 'avatarUrl'
    | '__typename'
    | 'firstName'
    | 'lastName'
  > | null;
};

const accountOwner = {
  email: 'charles@test.com',
  displayName: 'Charles Test',
  firstName: 'Charles',
  lastName: 'Test',
  id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
};

export const mockedPipelineProgressData: Array<MockedPipelineProgress> = [
  {
    id: '0ac8761c-1ad6-11ee-be56-0242ac120002',
    amount: 78,
    closeDate: '2021-10-01T00:00:00.000Z',
    companyId: '0',
    accountOwner: accountOwner,
    pipelineStageId: 'another-pipeline-stage-1',
    progressableType: PipelineProgressableType.Company,
  },
  {
    id: 'fe256b39-3ec3-4fe7-8998-b76aa0bfb600',
    companyId: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
    pipelineStageId: 'fe256b39-3ec3-4fe3-8998-b76aa0bfb600',
    amount: 7,
    closeDate: '2021-10-01T00:00:00.000Z',
    accountOwner,
    progressableType: PipelineProgressableType.Company,
  },
  {
    id: '4a886c90-f4f2-4984-8222-882ebbb905d6',
    companyId: 'b396e6b9-dc5c-4643-bcff-61b6cf7523ae',
    amount: 100,
    closeDate: '2021-10-01T00:00:00.000Z',
    accountOwner,
    pipelineStageId: 'fe256b39-3ec3-4fe3-8998-b76aa0bfb600',
    progressableType: PipelineProgressableType.Company,
  },
];
