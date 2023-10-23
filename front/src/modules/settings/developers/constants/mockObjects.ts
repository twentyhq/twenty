import { v4 } from 'uuid';

import { ApisFiedlItem } from '../types/ApisFieldItem';

export const activeApiKeyItems: ApisFiedlItem[] = [
  {
    id: v4(),
    name: 'Zapier key',
    type: 'internal',
    expiration: 'In 80 days',
  },
  {
    id: v4(),
    name: 'Notion',
    type: 'internal',
    expiration: 'Expired',
  },
  {
    id: v4(),
    name: 'Trello',
    type: 'internal',
    expiration: 'In 1 year',
  },
  {
    id: v4(),
    name: 'Cargo',
    type: 'published',
    expiration: 'Never',
  },
  {
    id: v4(),
    name: 'Backoffice',
    type: 'published',
    expiration: 'In 32 days',
  },
];
