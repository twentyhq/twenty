import {
  Company,
  GraphqlMutationCompany,
  GraphqlQueryCompany,
  mapToCompany,
  mapToGqlCompany,
} from '../company.interface';

describe('Company mappers', () => {
  it('should map GraphQl Company to Company', () => {
    const now = new Date();
    now.setMilliseconds(0);
    const graphQLCompany = {
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      name: 'ACME',
      domainName: 'exmaple.com',
      createdAt: now.toUTCString(),
      employees: 10,
      address: '1 Infinite Loop, 95014 Cupertino, California, USA',
      _commentCount: 1,
      accountOwner: {
        id: '7af20dea-0412-4c4c-8b13-d6f0e6e09e87',
        email: 'john@example.com',
        displayName: 'John Doe',
        avatarUrl: 'https://example.com/avatar.png',
        __typename: 'User',
      },
      pipes: [
        {
          id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6c',
          name: 'Pipe 1',
          icon: '!',
          __typename: 'Pipe',
        },
      ],
      __typename: 'Company',
    } satisfies GraphqlQueryCompany;

    const company = mapToCompany(graphQLCompany);
    expect(company).toStrictEqual({
      __typename: 'Company',
      id: graphQLCompany.id,
      name: graphQLCompany.name,
      domainName: graphQLCompany.domainName,
      createdAt: new Date(now.toUTCString()),
      employees: graphQLCompany.employees,
      address: graphQLCompany.address,
      _commentCount: 1,
      accountOwner: {
        __typename: 'users',
        id: '7af20dea-0412-4c4c-8b13-d6f0e6e09e87',
        email: 'john@example.com',
        avatarUrl: 'https://example.com/avatar.png',
        displayName: 'John Doe',
        workspaceMember: undefined,
      },
      pipes: [],
    } satisfies Company);
  });

  it('should map Company to GraphQLCompany', () => {
    const now = new Date();
    now.setMilliseconds(0);
    const company = {
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      name: 'ACME',
      domainName: 'example.com',
      employees: 10,
      address: '1 Infinite Loop, 95014 Cupertino, California, USA',
      pipes: [],
      _commentCount: 1,
      accountOwner: {
        id: '522d4ec4-c46b-4360-a0a7-df8df170be81',
        email: 'john@example.com',
        avatarUrl: 'https://example.com/avatar.png',
        displayName: 'John Doe',
        __typename: 'users',
      },
      createdAt: now,
      __typename: 'Company',
    } satisfies Company;
    const graphQLCompany = mapToGqlCompany(company);
    expect(graphQLCompany).toStrictEqual({
      id: company.id,
      name: company.name,
      domainName: company.domainName,
      createdAt: now.toUTCString(),
      employees: company.employees,
      address: company.address,
      accountOwnerId: '522d4ec4-c46b-4360-a0a7-df8df170be81',
      __typename: 'Company',
    } satisfies GraphqlMutationCompany);
  });
});
