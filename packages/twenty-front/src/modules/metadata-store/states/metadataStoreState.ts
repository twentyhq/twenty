import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export type MetadataEntityStoreStatus =
  | 'empty'
  | 'draft-pending'
  | 'up-to-date';

export const ALL_METADATA_ENTITY_KEYS = [
  'objectMetadataItems',
  'fieldMetadataItems',
  'views',
  'viewFields',
  'viewFilters',
  'viewSorts',
  'pageLayouts',
  'logicFunctions',
  'navigationMenuItems',
] as const;

export type MetadataEntityKey = (typeof ALL_METADATA_ENTITY_KEYS)[number];

export type MetadataStoreItem = {
  current: object[];
  draft: object[];
  status: MetadataEntityStoreStatus;
};

const METADATA_STORE_ITEM_INITIAL_VALUE: MetadataStoreItem = {
  current: [],
  draft: [],
  status: 'empty',
};

export const metadataStoreState = createAtomFamilyState<
  MetadataStoreItem,
  MetadataEntityKey
>({
  key: 'metadataStoreState',
  defaultValue: METADATA_STORE_ITEM_INITIAL_VALUE,
});
