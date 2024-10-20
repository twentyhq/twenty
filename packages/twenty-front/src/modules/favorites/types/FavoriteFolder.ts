export type FavoriteFolder = {
  id: string;
  name: string;
  icon: string;

  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  __typename: 'FavoriteFolder';
};
