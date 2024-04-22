import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export type FieldCellFamilyKey = {
  recordId: string;
  fieldName: string;
};

export type FieldCellValue = {
  fieldValue: unknown;
  isEmpty: boolean;
  hasSoftFocus: boolean;
  isInEditMode: boolean;
};

export const fieldCellFamilyState = createFamilyState<
  FieldCellValue,
  FieldCellFamilyKey
>({
  key: 'fieldCellFamilyState',
  defaultValue: {
    fieldValue: null,
    isEmpty: true,
    hasSoftFocus: false,
    isInEditMode: false,
  },
});
