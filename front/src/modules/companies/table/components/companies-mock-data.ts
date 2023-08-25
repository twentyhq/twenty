import { Company, User } from '../../../../generated/graphql';

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
    linkedinUrl: 'https://www.linkedin.com/company/airbnb/',
    xUrl: 'https://twitter.com/airbnb',
    annualRecurringRevenue: 500000,
    idealCustomerProfile: true,
    createdAt: '2023-04-26T10:08:54.724515+00:00',
    address: 'San Francisco, CA',
    employees: 5000,
    _activityCount: 0,
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
    domainName: 'qonto.com',
    name: 'Qonto',
    linkedinUrl: 'https://www.linkedin.com/company/qonto/',
    xUrl: 'https://twitter.com/qonto',
    annualRecurringRevenue: 500000,
    idealCustomerProfile: false,
    createdAt: '2023-04-26T10:12:42.33625+00:00',
    address: 'Paris, France',
    employees: 800,
    _activityCount: 0,
    accountOwner: null,
    __typename: 'Company',
  },
  {
    id: 'a674fa6c-1455-4c57-afaf-dd5dc086361d',
    domainName: 'stripe.com',
    name: 'Stripe',
    linkedinUrl: 'https://www.linkedin.com/company/stripe/',
    xUrl: 'https://twitter.com/stripe',
    annualRecurringRevenue: 5000000,
    idealCustomerProfile: false,
    createdAt: '2023-04-26T10:10:32.530184+00:00',
    address: 'San Francisco, CA',
    employees: 8000,
    _activityCount: 0,
    accountOwner: null,
    __typename: 'Company',
  },
  {
    id: 'b1cfd51b-a831-455f-ba07-4e30671e1dc3',
    domainName: 'figma.com',
    linkedinUrl: 'https://www.linkedin.com/company/figma/',
    xUrl: 'https://twitter.com/figma',
    annualRecurringRevenue: 50000,
    idealCustomerProfile: true,
    name: 'Figma',
    createdAt: '2023-03-21T06:30:25.39474+00:00',
    address: 'San Francisco, CA',
    employees: 800,
    _activityCount: 0,
    accountOwner: null,
    __typename: 'Company',
  },
  {
    id: '5c21e19e-e049-4393-8c09-3e3f8fb09ecb',
    domainName: 'notion.com',
    linkedinUrl: 'https://www.linkedin.com/company/notion/',
    xUrl: 'https://twitter.com/notion',
    annualRecurringRevenue: 500000,
    idealCustomerProfile: false,
    name: 'Notion',
    createdAt: '2023-04-26T10:13:29.712485+00:00',
    address: 'San Francisco, CA',
    employees: 400,
    _activityCount: 0,
    accountOwner: null,
    __typename: 'Company',
  },
];
