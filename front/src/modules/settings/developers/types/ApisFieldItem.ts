export type ApiKeyItem = {
  id: string;
  name: string;
  type: 'internal' | 'published';
  expiration: string;
};
