import {
  GraphqlMutationPerson,
  GraphqlQueryPerson,
} from '../../../interfaces/person.interface';
import { updatePerson } from '../update';

jest.mock('../../../apollo', () => {
  const personInterface = jest.requireActual(
    '../../../interfaces/person.interface',
  );
  return {
    apiClient: {
      mutate: (arg: {
        mutation: unknown;
        variables: GraphqlMutationPerson;
      }) => {
        const gqlPerson = arg.variables as unknown as GraphqlQueryPerson;
        return { data: personInterface.mapPerson(gqlPerson) };
      },
    },
  };
});

it('updates a person', async () => {
  const result = await updatePerson({
    fullName: 'John Doe',
    id: 1,
    email: 'john@example.com',
    company: {
      id: 2,
      name: 'ACME',
      domain: 'example.com',
    },
    phone: '+1 (555) 123-4567',
    pipe: {
      id: 3,
      name: 'Customer',
      icon: '!',
    },
    creationDate: new Date(),
    city: 'San Francisco',
    countryCode: 'US',
  });
  expect(result.data).toBeDefined();
  result.data && expect(result.data.email).toBe('john@example.com');
});
