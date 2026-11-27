import { type MetadataEntityKey } from '@/metadata-store/states/metadataStoreState';

export const VIEW_METADATA_ENTITY_KEYS = [
  'views',
  'viewFields',
  'viewFilters',
  'viewSorts',
  'viewGroups',
  'viewFilterGroups',
  'viewFieldGroups',
] as const satisfies MetadataEntityKey[];
