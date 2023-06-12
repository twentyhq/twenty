import {
  GraphqlMutationPerson,
  GraphqlQueryPerson,
  mapToGqlPerson,
  mapToPerson,
  Person,
} from '../person.interface';

describe('Person mappers', () => {
  it('should map GraphqlPerson to Person', () => {
    const now = new Date();
    now.setMilliseconds(0);
    const graphQLPerson = {
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      firstname: 'John',
      lastname: 'Doe',
      createdAt: now.toUTCString(),
      email: 'john.doe@gmail.com',
      phone: '+1 (555) 123-4567',
      city: 'Paris',
      _commentCount: 1,
      company: {
        id: '7af20dea-0412-4c4c-8b13-d6f0e6e09e87',
        name: 'John Doe',
        __typename: 'Company',
      },
      __typename: 'people',
    } satisfies GraphqlQueryPerson;

    const person = mapToPerson(graphQLPerson);
    expect(person).toStrictEqual({
      __typename: 'people',
      id: graphQLPerson.id,
      firstname: graphQLPerson.firstname,
      lastname: graphQLPerson.lastname,
      createdAt: new Date(now.toUTCString()),
      email: graphQLPerson.email,
      city: graphQLPerson.city,
      phone: graphQLPerson.phone,
      _commentCount: 1,
      company: {
        __typename: 'companies',
        id: '7af20dea-0412-4c4c-8b13-d6f0e6e09e87',
        accountOwner: undefined,
        address: undefined,
        createdAt: undefined,
        domainName: undefined,
        employees: undefined,
        _commentCount: undefined,
        name: 'John Doe',
        pipes: [],
      },
    } satisfies Person);
  });

  it('should map Person to GraphQlPerson', () => {
    const now = new Date();
    now.setMilliseconds(0);
    const person = {
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      firstname: 'John',
      lastname: 'Doe',
      createdAt: new Date(now.toUTCString()),
      email: 'john.doe@gmail.com',
      phone: '+1 (555) 123-4567',
      city: 'Paris',
      _commentCount: 1,
      company: {
        id: '7af20dea-0412-4c4c-8b13-d6f0e6e09e87',
      },
    } satisfies Person;

    const graphQLPerson = mapToGqlPerson(person);
    expect(graphQLPerson).toStrictEqual({
      id: person.id,
      firstname: person.firstname,
      lastname: person.lastname,
      createdAt: now.toUTCString(),
      email: person.email,
      city: person.city,
      phone: person.phone,
      companyId: '7af20dea-0412-4c4c-8b13-d6f0e6e09e87',
      __typename: 'people',
    } satisfies GraphqlMutationPerson);
  });
});
