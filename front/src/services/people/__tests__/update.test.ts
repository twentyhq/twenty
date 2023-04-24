import { createMockClient, RequestHandlerResponse } from 'mock-apollo-client';
import { UPDATE_PERSON, updatePerson } from '../update';
import { GraphqlQueryPerson } from '../../../interfaces/person.interface';

const mockClient = createMockClient();

const PERSON_RESULT = {
  city: 'San Francisco',
  company: {
    company_domain: 'example.com',
    company_name: 'ACME',
    id: 1,
    __typename: 'Company',
  },
  email: 'john@example.com',
  firstname: 'John',
  id: 1,
  lastname: 'Doe',
  phone: '+1 (555) 123-4567',
  __typename: 'Person',
  created_at: 'today',
};

mockClient.setRequestHandler(UPDATE_PERSON, () => {
  return new Promise<RequestHandlerResponse<GraphqlQueryPerson>>((resolve) =>
    resolve({ data: PERSON_RESULT }),
  );
});

it('updates a person', async () => {
  const result = await updatePerson(
    {
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
    },
    mockClient,
  );
  expect(result.data.email).toBe('john@example.com');
});
