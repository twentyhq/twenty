import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { createIndexedDbBackedJotaiStorage } from '@/ui/utilities/state/jotai/utils/createIndexedDbBackedJotaiStorage';

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
  // TODO: clarify what really is metadata  (syncable entity?)
  // vs 'core engine entity' or 'broadcastable entity'
  'agentChatThreads',
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

export const METADATA_STORE_KEY_PREFIX = 'metadataStoreState__';

// The metadata cache is persisted to IndexedDB (not localStorage) because it
// grows with the workspace schema and large workspaces exceed Safari's ~5MB
// localStorage cap. We migrate any pre-existing localStorage snapshot on boot.
const { storage, hydrate, clear } =
  createIndexedDbBackedJotaiStorage<MetadataStoreItem>({
    migrateFromLocalStorageKeys: ALL_METADATA_ENTITY_KEYS.map(
      (entityKey) => `${METADATA_STORE_KEY_PREFIX}${entityKey}`,
    ),
  });

// Must be awaited before the React tree mounts so atoms hydrate synchronously
// from the loaded snapshot (atomWithStorage getOnInit:true).
export const hydrateMetadataStore = hydrate;

// Wipes the persisted metadata cache (used on logout / session reset).
export const clearMetadataStoreStorage = clear;

export const metadataStoreState = createAtomFamilyState<
  MetadataStoreItem,
  MetadataEntityKey
>({
  key: 'metadataStoreState',
  defaultValue: METADATA_STORE_ITEM_INITIAL_VALUE,
  storage,
  localStorageOptions: { getOnInit: true },
});
