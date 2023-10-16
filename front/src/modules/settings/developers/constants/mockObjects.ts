import { ApisFiedlItem } from '../types/ApisFieldItem';

export const activeApiKeyItems: ApisFiedlItem[] = [
  {
    name: 'Zapier key',
    type: 'internal',
    expiration: 'In 80 days',
  },
  {
    name: 'Notion',
    type: 'internal',
    expiration: 'Expired',
  },
  {
    name: 'Trello',
    type: 'internal',
    expiration: 'In 1 year',
  },
  {
    name: 'Cargo',
    type: 'published',
    expiration: 'Never',
  },
  {
    name: 'Backoffice',
    type: 'published',
    expiration: 'In 32 days',
  },
];
