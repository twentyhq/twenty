import { ApiKey } from '@/settings/developers/types/api-key/ApiKey';

type MockedApiKey = Pick<
  ApiKey,
  'id' | 'name' | 'createdAt' | 'updatedAt' | 'expiresAt'
>;
export const mockedApiKeys: Array<MockedApiKey> = [
  {
    id: 'f7c6d736-8fcd-4e9c-ab99-28f6a9031570',
    name: 'Zapier Integration',
    createdAt: '2023-04-26T10:12:42.33625+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    expiresAt: '2100-11-06T23:59:59.825Z',
  },
  {
    id: 'f7c6d736-8fcd-4e9c-ab99-28f6a9031571',
    name: 'Gmail Integration',
    createdAt: '2023-04-26T10:12:42.33625+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    expiresAt: '2100-11-06T23:59:59.825Z',
  },
  {
    id: 'f7c6d736-8fcd-4e9c-ab99-28f6a9031572',
    name: 'Github Integration',
    createdAt: '2023-04-26T10:12:42.33625+00:00',
    updatedAt: '2023-04-26T10:23:42.33625+00:00',
    expiresAt: '2022-11-06T23:59:59.825Z',
  },
];
