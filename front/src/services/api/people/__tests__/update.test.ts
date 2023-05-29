import {
  GraphqlMutationPerson,
  GraphqlQueryPerson,
} from '../../../../interfaces/entities/person.interface';
import { updatePerson } from '../update';

jest.mock('../../../../apollo', () => {
  const personInterface = jest.requireActual(
    '../../../../interfaces/entities/person.interface',
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
      __typename: 'companies',
    },
    phone: '+1 (555) 123-4567',
    pipes: [
      {
        id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6d',
        name: 'Customer',
        icon: '!',
      },
    ],
    createdAt: new Date(),
    city: 'San Francisco',
    __typename: 'people',
  });
  expect(result.data).toBeDefined();
  result.data && expect(result.data.email).toBe('john@example.com');
});
