import { v4 as uuidv4 } from 'uuid';

import { ApisFiedlItem } from '../types/ApisFieldItem';

const generateUniqueID = () => {
  return uuidv4(); // Generate a unique string ID
};

export const activeApiKeyItems: ApisFiedlItem[] = [
  {
    id: generateUniqueID(),
    name: 'Zapier key',
    type: 'internal',
    expiration: 'In 80 days',
  },
  {
    id: generateUniqueID(),
    name: 'Notion',
    type: 'internal',
    expiration: 'Expired',
  },
  {
    id: generateUniqueID(),
    name: 'Trello',
    type: 'internal',
    expiration: 'In 1 year',
  },
  {
    id: generateUniqueID(),
    name: 'Cargo',
    type: 'published',
    expiration: 'Never',
  },
  {
    id: generateUniqueID(),
    name: 'Backoffice',
    type: 'published',
    expiration: 'In 32 days',
  },
];
