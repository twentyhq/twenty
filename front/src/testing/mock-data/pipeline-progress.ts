import { PipelineProgress, User } from '../../generated/graphql';

type MockedPipelineProgress = Pick<
  PipelineProgress,
  'id' | 'amount' | 'closeDate'
> & {
  accountOwner: Pick<
    User,
    'id' | 'email' | 'displayName' | '__typename' | 'firstName' | 'lastName'
  > | null;
};

export const mockedPipelineProgressData: Array<MockedPipelineProgress> = [
  {
    id: '0ac8761c-1ad6-11ee-be56-0242ac120002',
    amount: 78,
    accountOwner: {
      email: 'charles@test.com',
      displayName: 'Charles Test',
      firstName: 'Charles',
      lastName: 'Test',
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      __typename: 'User',
    },
  },
];
