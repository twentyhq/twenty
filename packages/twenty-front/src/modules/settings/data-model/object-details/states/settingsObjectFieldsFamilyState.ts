import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export type SortedFieldByTableFamilyStateKey = {
  objectMetadataItemId: string;
};

export const settingsObjectFieldsFamilyState = createAtomFamilyState<
  FieldMetadataItem[] | null,
  SortedFieldByTableFamilyStateKey
>({
  key: 'settingsObjectFieldsFamilyState',
  defaultValue: null,
});
