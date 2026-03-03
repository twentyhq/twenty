import { type IndexMetadataItem } from '@/object-metadata/types/IndexMetadataItem';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export type SortedIndexByTableFamilyStateKey = {
  objectMetadataItemId: string;
};

export const settingsObjectIndexesFamilyState = createAtomFamilyState<
  IndexMetadataItem[] | null,
  SortedIndexByTableFamilyStateKey
>({
  key: 'settingsObjectIndexesFamilyState',
  defaultValue: null,
});
