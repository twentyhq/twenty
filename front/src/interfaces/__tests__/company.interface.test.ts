import { mapToGqlCompany, mapToCompany } from '../company.interface';

describe('mapCompany', () => {
  it('should map company', () => {
    const now = new Date();
    now.setMilliseconds(0);
    const company = mapToCompany({
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      name: 'ACME',
      domain_name: 'exmaple.com',
      created_at: now.toUTCString(),
      account_owner: {
        id: '7af20dea-0412-4c4c-8b13-d6f0e6e09e87',
        email: 'john@example.com',
        display_name: 'John Doe',
        __typename: 'User',
      },
      employees: '10',
      address: '1 Infinite Loop, 95014 Cupertino, California, USA',
      __typename: 'Company',
    });
    expect(company.id).toBe('7dfbc3f7-6e5e-4128-957e-8d86808cdf6b');
    expect(company.name).toBe('ACME');
    expect(company.domainName).toBe('exmaple.com');
    expect(company.creationDate).toEqual(now);
    expect(company.accountOwner?.id).toBe(
      '7af20dea-0412-4c4c-8b13-d6f0e6e09e87',
    );
    expect(company.accountOwner?.email).toBe('john@example.com');
    expect(company.accountOwner?.displayName).toBe('John Doe');
    expect(company.employees).toBe('10');
    expect(company.address).toBe(
      '1 Infinite Loop, 95014 Cupertino, California, USA',
    );
  });

  it('should map company with no account owner', () => {
    const now = new Date();
    now.setMilliseconds(0);
    const company = mapToCompany({
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      name: 'ACME',
      domain_name: 'exmaple.com',
      created_at: now.toUTCString(),
      employees: '10',
      address: '1 Infinite Loop, 95014 Cupertino, California, USA',
      __typename: 'Company',
    });
    expect(company.id).toBe('7dfbc3f7-6e5e-4128-957e-8d86808cdf6b');
    expect(company.name).toBe('ACME');
    expect(company.domainName).toBe('exmaple.com');
    expect(company.creationDate).toEqual(now);
    expect(company.accountOwner).toBeUndefined();
    expect(company.employees).toBe('10');
    expect(company.address).toBe(
      '1 Infinite Loop, 95014 Cupertino, California, USA',
    );
  });

  it('should map company back', () => {
    const now = new Date();
    now.setMilliseconds(0);
    const company = mapToGqlCompany({
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      name: 'ACME',
      domainName: 'example.com',
      employees: '10',
      address: '1 Infinite Loop, 95014 Cupertino, California, USA',
      pipes: [],
      accountOwner: {
        id: '522d4ec4-c46b-4360-a0a7-df8df170be81',
        email: 'john@example.com',
        displayName: 'John Doe',
      },
      creationDate: now,
    });
    expect(company.id).toBe('7dfbc3f7-6e5e-4128-957e-8d86808cdf6b');
    expect(company.name).toBe('ACME');
    expect(company.domain_name).toBe('example.com');
    expect(company.created_at).toEqual(now.toUTCString());
    expect(company.account_owner_id).toBe(
      '522d4ec4-c46b-4360-a0a7-df8df170be81',
    );
    expect(company.employees).toBe('10');
    expect(company.address).toBe(
      '1 Infinite Loop, 95014 Cupertino, California, USA',
    );
  });

  it('should map company with no account owner back', () => {
    const now = new Date();
    now.setMilliseconds(0);
    const company = mapToGqlCompany({
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      name: 'ACME',
      domainName: 'example.com',
      employees: '10',
      address: '1 Infinite Loop, 95014 Cupertino, California, USA',
      pipes: [],
      creationDate: now,
    });
    expect(company.id).toBe('7dfbc3f7-6e5e-4128-957e-8d86808cdf6b');
    expect(company.name).toBe('ACME');
    expect(company.domain_name).toBe('example.com');
    expect(company.created_at).toEqual(now.toUTCString());
    expect(company.account_owner_id).toBeUndefined();
    expect(company.employees).toBe('10');
    expect(company.address).toBe(
      '1 Infinite Loop, 95014 Cupertino, California, USA',
    );
  });
});
