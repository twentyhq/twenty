import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export type SortedFieldByTableFamilyStateKey = {
  objectMetadataItemId: string;
};

export const settingsObjectFieldsFamilyState = createFamilyState<
  FieldMetadataItem[] | null,
  SortedFieldByTableFamilyStateKey
>({
  key: 'settingsObjectFieldsFamilyState',
  defaultValue: null,
});
