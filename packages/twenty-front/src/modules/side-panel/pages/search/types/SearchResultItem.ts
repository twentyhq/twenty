export type SearchResultItem = {
  id: string;
  label: string;
  objectNameSingular: string;
  recordId: string;
  imageUrl?: string | null;
  objectLabel: string;
  avatarShape: 'square' | 'circle';
};
