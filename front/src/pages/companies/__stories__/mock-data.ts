import { GraphqlQueryCompany } from '../../../interfaces/company.interface';

export const defaultData: Array<GraphqlQueryCompany> = [
  {
    id: 1,
    company_name: 'ACME',
    company_domain: 'example.com',
    account_owner: {
      id: 1,
      email: 'john@example.com',
      displayName: 'John Doe',
    },
    employees: 10,
    address: '1 Infinity Loop, 95014 Cupertino, California',
    created_at: 'Wed Apr 1 12:00:01 CEST 2023',
  },
];
