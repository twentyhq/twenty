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

// Persisted to IndexedDB (not localStorage) so large workspace schemas don't hit
// Safari's ~5MB localStorage cap.
const { storage, hydrate, clear } =
  createIndexedDbBackedJotaiStorage<MetadataStoreItem>({
    legacyLocalStorageKeysToClear: ALL_METADATA_ENTITY_KEYS.map(
      (entityKey) => `${METADATA_STORE_KEY_PREFIX}${entityKey}`,
    ),
  });

// Must be awaited before the React tree mounts so atoms hydrate synchronously
// (atomWithStorage getOnInit:true).
export const hydrateMetadataStore = hydrate;

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
