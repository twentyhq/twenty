import { type View } from '@/views/types/View';

export type ViewSummary = Pick<
  View,
  | 'id'
  | 'universalIdentifier'
  | 'name'
  | 'icon'
  | 'type'
  | 'key'
  | 'objectMetadataId'
  | 'position'
  | 'isPrivate'
  | 'isActive'
>;
