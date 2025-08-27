import { type IndexMetadataItem } from '@/object-metadata/types/IndexMetadataItem';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export type SortedIndexByTableFamilyStateKey = {
  objectMetadataItemId: string;
};

export const settingsObjectIndexesFamilyState = createFamilyState<
  IndexMetadataItem[] | null,
  SortedIndexByTableFamilyStateKey
>({
  key: 'settingsObjectIndexesFamilyState',
  defaultValue: null,
});
