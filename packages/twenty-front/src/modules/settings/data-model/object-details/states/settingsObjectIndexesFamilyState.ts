import { type IndexMetadataItem } from '@/object-metadata/types/IndexMetadataItem';
import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

export type SortedIndexByTableFamilyStateKey = {
  objectMetadataItemId: string;
};

export const settingsObjectIndexesFamilyState = createFamilyStateV2<
  IndexMetadataItem[] | null,
  SortedIndexByTableFamilyStateKey
>({
  key: 'settingsObjectIndexesFamilyState',
  defaultValue: null,
});
