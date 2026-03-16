import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { createCompressedLocalStorage } from '@/ui/utilities/state/jotai/utils/createCompressedLocalStorage';

export type MetadataEntityStoreStatus =
  | 'empty'
  | 'draft-pending'
  | 'up-to-date';

export const ALL_METADATA_ENTITY_KEYS = [
  'objectMetadataItems',
  'fieldMetadataItems',
  'indexMetadataItems',
  'views',
  'viewFields',
  'viewFilters',
  'viewSorts',
  'viewGroups',
  'viewFilterGroups',
  'viewFieldGroups',
  'pageLayouts',
  'pageLayoutTabs',
  'pageLayoutWidgets',
  'logicFunctions',
  'navigationMenuItems',
  'commandMenuItems',
  'frontComponents',
  'webhooks',
  'roles',
  'roleTargets',
  'agents',
  'skills',
  'rowLevelPermissionPredicates',
  'rowLevelPermissionPredicateGroups',
] as const;

export type MetadataEntityKey = (typeof ALL_METADATA_ENTITY_KEYS)[number];

export type MetadataStoreItem = {
  current: object[];
  draft: object[];
  status: MetadataEntityStoreStatus;
  currentCollectionHash?: string;
  draftCollectionHash?: string;
};

const METADATA_STORE_ITEM_INITIAL_VALUE: MetadataStoreItem = {
  current: [],
  draft: [],
  status: 'empty',
};

// OMNIA-CUSTOM: Use compressed localStorage persistence. Our workspace metadata
// (952 fields, 593 view fields, 23 entity types × current+draft) exceeds
// Safari's 5MB localStorage quota when stored as raw JSON. lz-string UTF-16
// compression reduces the payload ~80-90%, keeping it within limits while
// preserving the upstream's synchronous stale-while-revalidate loading.
export const metadataStoreState = createAtomFamilyState<
  MetadataStoreItem,
  MetadataEntityKey
>({
  key: 'metadataStoreState',
  defaultValue: METADATA_STORE_ITEM_INITIAL_VALUE,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
  customStringStorage: createCompressedLocalStorage(),
});
