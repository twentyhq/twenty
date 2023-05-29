import { GraphqlQueryUser } from '../../interfaces/entities/user.interface';

export const mockedUsersData: Array<GraphqlQueryUser> = [
  {
    id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
    __typename: 'User',
    email: 'charles@test.com',
    displayName: 'Charles Test',
  },
  {
    id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6c',
    __typename: 'User',
    email: 'felix@test.com',
    displayName: 'Felix Test',
  },
];
