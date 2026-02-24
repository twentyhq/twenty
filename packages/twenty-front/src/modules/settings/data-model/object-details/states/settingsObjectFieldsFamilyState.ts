import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

export type SortedFieldByTableFamilyStateKey = {
  objectMetadataItemId: string;
};

export const settingsObjectFieldsFamilyState = createFamilyStateV2<
  FieldMetadataItem[] | null,
  SortedFieldByTableFamilyStateKey
>({
  key: 'settingsObjectFieldsFamilyState',
  defaultValue: null,
});
