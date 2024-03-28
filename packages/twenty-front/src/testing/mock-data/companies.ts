import { Company } from '@/companies/types/Company';
import { Favorite } from '@/favorites/types/Favorite';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

import { mockedUsersData } from './users';

type MockedCompany = Omit<Company, 'deletedAt'> & {
  accountOwner: WorkspaceMember | null;
  Favorite: Pick<Favorite, 'id'> | null;
};

export const mockedCompaniesData: Array<MockedCompany> = [
  {
    id: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
    domainName: 'airbnb.com',
    name: 'Airbnb',
    createdAt: '2023-04-26T10:08:54.724515+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    address: '17 rue de clignancourt',
    employees: 12,
    linkedinLink: {
      url: 'https://www.linkedin.com/company/airbnb/',
      label: 'https://www.linkedin.com/company/airbnb/',
    },
    xLink: {
      url: 'https://twitter.com/airbnb',
      label: 'https://twitter.com/airbnb',
    },
    annualRecurringRevenue: { amountMicros: 5000000, currencyCode: 'USD' },
    idealCustomerProfile: true,
    Favorite: null,
    accountOwnerId: mockedUsersData[0].id,
    accountOwner: {
      name: {
        firstName: 'Charles',
        lastName: 'Test',
      },
      avatarUrl: null,
      id: mockedUsersData[0].id,
      locale: 'en',
      colorScheme: 'Light',
      updatedAt: '2023-04-26T10:23:42.33625+00:00',
      createdAt: '2023-04-26T10:23:42.33625+00:00',
      userId: mockedUsersData[0].id,
      userEmail: 'charles@test.com',
    },
  },
  {
    id: 'b396e6b9-dc5c-4643-bcff-61b6cf7523ae',
    domainName: 'aircall.io',
    name: 'Aircall',
    createdAt: '2023-04-26T10:12:42.33625+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    address: '',
    employees: 1,
    accountOwnerId: null,
    linkedinLink: {
      url: 'https://www.linkedin.com/company/aircall/',
      label: 'https://www.linkedin.com/company/aircall/',
    },
    xLink: {
      url: 'https://twitter.com/aircall',
      label: 'https://twitter.com/aircall',
    },
    annualRecurringRevenue: { amountMicros: 500000, currencyCode: 'USD' },
    idealCustomerProfile: false,
    accountOwner: null,
    Favorite: null,
  },
  {
    id: 'a674fa6c-1455-4c57-afaf-dd5dc086361d',
    domainName: 'algolia.com',
    name: 'Algolia',
    createdAt: '2023-04-26T10:10:32.530184+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    address: '',
    employees: 1,
    linkedinLink: {
      url: 'https://www.linkedin.com/company/algolia/',
      label: 'https://www.linkedin.com/company/algolia/',
    },
    xLink: {
      url: 'https://twitter.com/algolia',
      label: 'https://twitter.com/algolia',
    },
    annualRecurringRevenue: { amountMicros: 5000000, currencyCode: 'USD' },
    idealCustomerProfile: true,
    accountOwner: null,
    Favorite: null,
    accountOwnerId: null,
  },
  {
    id: 'b1cfd51b-a831-455f-ba07-4e30671e1dc3',
    domainName: 'apple.com',
    name: 'Apple',
    createdAt: '2023-03-21T06:30:25.39474+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    address: '',
    employees: 10,
    linkedinLink: {
      url: 'https://www.linkedin.com/company/apple/',
      label: 'https://www.linkedin.com/company/apple/',
    },
    xLink: {
      url: 'https://twitter.com/apple',
      label: 'https://twitter.com/apple',
    },
    annualRecurringRevenue: { amountMicros: 1000000, currencyCode: 'USD' },
    idealCustomerProfile: false,
    accountOwner: null,
    Favorite: null,
    accountOwnerId: null,
  },
  {
    id: '5c21e19e-e049-4393-8c09-3e3f8fb09ecb',
    domainName: 'qonto.com',
    name: 'Qonto',
    createdAt: '2023-04-26T10:13:29.712485+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    address: '10 rue de la Paix',
    employees: 1,
    linkedinLink: {
      url: 'https://www.linkedin.com/company/qonto/',
      label: 'https://www.linkedin.com/company/qonto/',
    },
    xLink: {
      url: 'https://twitter.com/qonto',
      label: 'https://twitter.com/qonto',
    },
    annualRecurringRevenue: { amountMicros: 5000000, currencyCode: 'USD' },
    idealCustomerProfile: false,
    accountOwner: null,
    Favorite: null,
    accountOwnerId: null,
  },
  {
    id: '9d162de6-cfbf-4156-a790-e39854dcd4eb',
    domainName: 'facebook.com',
    name: 'Facebook',
    createdAt: '2023-04-26T10:09:25.656555+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    address: '',
    employees: 1,
    linkedinLink: {
      url: 'https://www.linkedin.com/company/facebook/',
      label: 'https://www.linkedin.com/company/facebook/',
    },
    xLink: {
      url: 'https://twitter.com/facebook',
      label: 'https://twitter.com/facebook',
    },
    annualRecurringRevenue: { amountMicros: 5000000, currencyCode: 'USD' },
    idealCustomerProfile: true,
    accountOwner: null,
    Favorite: null,
    accountOwnerId: null,
  },
  {
    id: '9d162de6-cfbf-4156-a790-e39854dcd4ef',
    domainName: 'sequoia.com',
    name: 'Sequoia',
    createdAt: '2023-04-26T10:09:25.656555+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    address: '',
    employees: 1,
    linkedinLink: {
      url: 'https://www.linkedin.com/company/sequoia/',
      label: 'https://www.linkedin.com/company/sequoia/',
    },
    xLink: {
      url: 'https://twitter.com/sequoia',
      label: 'https://twitter.com/sequoia',
    },
    annualRecurringRevenue: { amountMicros: 5000000, currencyCode: 'USD' },
    idealCustomerProfile: true,
    accountOwner: null,
    Favorite: null,
    accountOwnerId: null,
  },
];

export const mockedDuplicateCompanyData: MockedCompany = {
  ...mockedCompaniesData[0],
  id: '8b40856a-2ec9-4c03-8bc0-c032c89e1824',
};

export const mockedEmptyCompanyData = {
  id: '9231e6ee-4cc2-4c7b-8c55-dff16f4d968a',
  name: '',
  domainName: '',
  address: '',
  accountOwner: null,
  annualRecurringRevenue: null,
  createdAt: null,
  updatedAt: null,
  employees: null,
  idealCustomerProfile: null,
  linkedinLink: null,
  xLink: null,
  _activityCount: null,
  __typename: 'Company',
};
