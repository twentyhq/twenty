import {
  GraphqlMutationPerson,
  GraphqlQueryPerson,
} from '../../interfaces/person.interface';
import { updatePerson } from '../update';

jest.mock('~/apollo', () => {
  const personInterface = jest.requireActual(
    '@/people/interfaces/person.interface',
  );
  return {
    apiClient: {
      mutate: (arg: {
        mutation: unknown;
        variables: GraphqlMutationPerson;
      }) => {
        const gqlPerson = arg.variables as unknown as GraphqlQueryPerson;
        return { data: personInterface.mapToPerson(gqlPerson) };
      },
    },
  };
});

it('updates a person', async () => {
  const result = await updatePerson({
    firstname: 'John',
    lastname: 'Doe',
    id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6c',
    email: 'john@example.com',
    company: {
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      name: 'ACME',
      domainName: 'example.com',
      __typename: 'Company',
    },
    phone: '+1 (555) 123-4567',
    pipes: [
      {
        id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6d',
        name: 'Customer',
        icon: '!',
      },
    ],
    createdAt: new Date().toISOString(),
    city: 'San Francisco',
    __typename: 'Person',
  });
  expect(result.data).toBeDefined();
  result.data && expect(result.data.email).toBe('john@example.com');
});
