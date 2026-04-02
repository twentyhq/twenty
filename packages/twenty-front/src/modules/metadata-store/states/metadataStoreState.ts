import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

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

export const metadataStoreState = createAtomFamilyState<
  MetadataStoreItem,
  MetadataEntityKey
>({
  key: 'metadataStoreState',
  defaultValue: METADATA_STORE_ITEM_INITIAL_VALUE,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
