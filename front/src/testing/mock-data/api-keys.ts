import { ApiKey } from '~/generated/graphql';

type MockedApiKey = Pick<
  ApiKey,
  'id' | 'name' | 'createdAt' | 'updatedAt' | 'expiresAt' | '__typename'
>;
export const mockedApiKeyToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0d2VudHktN2VkOWQyMTItMWMyNS00ZDAyLWJmMjUtNmFlY2NmN2VhNDE5IiwiaWF0IjoxNjk4MDkzMDU0LCJleHAiOjE2OTkzMTUxOTksImp0aSI6IjY0Njg3ZWNmLWFhYzktNDNmYi1hY2I4LTE1M2QzNzgwYmIzMSJ9.JkQ3u7aRiqOFQkgHcC-mgCU37096HRSo40A_9X8gEng';
export const mockedApiKeys: Array<MockedApiKey> = [
  {
    id: 'f7c6d736-8fcd-4e9c-ab99-28f6a9031570',
    name: 'Zapier Integration',
    createdAt: '2023-04-26T10:12:42.33625+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    expiresAt: '2100-11-06T23:59:59.825Z',
    __typename: 'ApiKey',
  },
];
