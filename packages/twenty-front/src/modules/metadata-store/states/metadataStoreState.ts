import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export type MetadataLoadStatus = 'empty' | 'draft_pending' | 'loaded';

export type MetadataKey =
  | 'objects'
  | 'views'
  | 'pageLayouts'
  | 'logicFunctions';

export const ALL_METADATA_KEYS: MetadataKey[] = [
  'objects',
  'views',
  'pageLayouts',
  'logicFunctions',
];

export type MetadataLoadEntry = {
  current: object[];
  draft: object[];
  status: MetadataLoadStatus;
};

const METADATA_LOAD_ENTRY_DEFAULT: MetadataLoadEntry = {
  current: [],
  draft: [],
  status: 'empty',
};

export const metadataStoreState = createAtomFamilyState<
  MetadataLoadEntry,
  MetadataKey
>({
  key: 'metadataStoreState',
  defaultValue: METADATA_LOAD_ENTRY_DEFAULT,
});
