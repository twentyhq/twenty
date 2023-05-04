import { GraphqlQueryCompany } from '../../../interfaces/company.interface';

export const defaultData: Array<GraphqlQueryCompany> = [
  {
    id: 'f121ab32-fac4-4b8c-9a3d-150c877319c2',
    name: 'ACME',
    domain_name: 'example.com',
    account_owner: {
      id: '91510aa5-ede6-451f-8029-a7fa69e4bad6',
      email: 'john@example.com',
      displayName: 'John Doe',
      __typename: 'User',
    },
    employees: 10,
    address: '1 Infinity Loop, 95014 Cupertino, California',
    created_at: new Date().toUTCString(),
  },
];
