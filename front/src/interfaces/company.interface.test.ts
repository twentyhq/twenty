import { mapGqlCompany, mapCompany } from './company.interface';

describe('mapCompany', () => {
  it('should map company', () => {
    const company = mapCompany({
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      name: 'ACME',
      domain_name: '',
      created_at: '',
      account_owner: {
        id: '',
        email: '',
        displayName: '',
      },
      employees: 0,
      address: '',
    });
    expect(company.name).toBe('ACME');
  });

  it('should map company back', () => {
    const company = mapGqlCompany({
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      name: 'ACME',
      domain_name: '',
      employees: 0,
      address: '',
      opportunities: [],
      accountOwner: {
        id: '',
        email: '',
        first_name: '',
        last_name: '',
      },
      creationDate: new Date(),
    });
    expect(company.name).toBe('ACME');
  });
});
