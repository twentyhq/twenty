import { companiesFieldDefinitions } from '@/companies/constants/companiesFieldDefinitions';
import { Company, User, ViewField } from '~/generated/graphql';

type MockedCompany = Pick<
  Company,
  | 'id'
  | 'name'
  | 'domainName'
  | '__typename'
  | 'createdAt'
  | 'address'
  | 'employees'
  | 'linkedinUrl'
  | 'xUrl'
  | 'annualRecurringRevenue'
  | 'idealCustomerProfile'
  | '_activityCount'
> & {
  accountOwner: Pick<
    User,
    | 'id'
    | 'email'
    | 'displayName'
    | 'avatarUrl'
    | '__typename'
    | 'firstName'
    | 'lastName'
  > | null;
};

export const mockedCompaniesData: Array<MockedCompany> = [
  {
    id: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
    domainName: 'airbnb.com',
    name: 'Airbnb',
    createdAt: '2023-04-26T10:08:54.724515+00:00',
    address: '17 rue de clignancourt',
    employees: 12,
    linkedinUrl: 'https://www.linkedin.com/company/airbnb/',
    xUrl: 'https://twitter.com/airbnb',
    annualRecurringRevenue: 500000,
    idealCustomerProfile: true,
    _activityCount: 1,
    accountOwner: {
      email: 'charles@test.com',
      displayName: 'Charles Test',
      firstName: 'Charles',
      lastName: 'Test',
      avatarUrl: null,
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      __typename: 'User',
    },
    __typename: 'Company',
  },
  {
    id: 'b396e6b9-dc5c-4643-bcff-61b6cf7523ae',
    domainName: 'aircall.io',
    name: 'Aircall',
    createdAt: '2023-04-26T10:12:42.33625+00:00',
    address: '',
    employees: 1,
    linkedinUrl: 'https://www.linkedin.com/company/aircall/',
    xUrl: 'https://twitter.com/aircall',
    annualRecurringRevenue: 50000,
    idealCustomerProfile: false,
    _activityCount: 1,
    accountOwner: null,
    __typename: 'Company',
  },
  {
    id: 'a674fa6c-1455-4c57-afaf-dd5dc086361d',
    domainName: 'algolia.com',
    name: 'Algolia',
    createdAt: '2023-04-26T10:10:32.530184+00:00',
    address: '',
    employees: 1,
    linkedinUrl: 'https://www.linkedin.com/company/algolia/',
    xUrl: 'https://twitter.com/algolia',
    annualRecurringRevenue: 500000,
    idealCustomerProfile: true,
    _activityCount: 1,
    accountOwner: null,
    __typename: 'Company',
  },
  {
    id: 'b1cfd51b-a831-455f-ba07-4e30671e1dc3',
    domainName: 'apple.com',
    name: 'Apple',
    createdAt: '2023-03-21T06:30:25.39474+00:00',
    address: '',
    employees: 10,
    linkedinUrl: 'https://www.linkedin.com/company/apple/',
    xUrl: 'https://twitter.com/apple',
    annualRecurringRevenue: 5000000,
    idealCustomerProfile: false,
    _activityCount: 0,
    accountOwner: null,
    __typename: 'Company',
  },
  {
    id: '5c21e19e-e049-4393-8c09-3e3f8fb09ecb',
    domainName: 'qonto.com',
    name: 'Qonto',
    createdAt: '2023-04-26T10:13:29.712485+00:00',
    address: '10 rue de la Paix',
    employees: 1,
    linkedinUrl: 'https://www.linkedin.com/company/qonto/',
    xUrl: 'https://twitter.com/qonto',
    annualRecurringRevenue: 500000,
    idealCustomerProfile: false,
    _activityCount: 2,
    accountOwner: null,
    __typename: 'Company',
  },
  {
    id: '9d162de6-cfbf-4156-a790-e39854dcd4eb',
    domainName: 'facebook.com',
    name: 'Facebook',
    createdAt: '2023-04-26T10:09:25.656555+00:00',
    address: '',
    employees: 1,
    linkedinUrl: 'https://www.linkedin.com/company/facebook/',
    xUrl: 'https://twitter.com/facebook',
    annualRecurringRevenue: 5000000,
    idealCustomerProfile: true,
    _activityCount: 13,
    accountOwner: null,
    __typename: 'Company',
  },
  {
    id: '9d162de6-cfbf-4156-a790-e39854dcd4ef',
    domainName: 'sequoia.com',
    name: 'Sequoia',
    createdAt: '2023-04-26T10:09:25.656555+00:00',
    address: '',
    employees: 1,
    linkedinUrl: 'https://www.linkedin.com/company/sequoia/',
    xUrl: 'https://twitter.com/sequoia',
    annualRecurringRevenue: 500000,
    idealCustomerProfile: true,
    _activityCount: 1,
    accountOwner: null,
    __typename: 'Company',
  },
];

export const mockedCompanyViewFields = companiesFieldDefinitions.map<ViewField>(
  (viewFieldDefinition) => ({
    __typename: 'ViewField',
    fieldName: viewFieldDefinition.label,
    id: viewFieldDefinition.id,
    index: viewFieldDefinition.order,
    isVisible: true,
    objectName: 'company',
    sizeInPx: viewFieldDefinition.size,
  }),
);
