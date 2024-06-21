import { ObjectRecordForSelect } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export type ObjectRecordAndSelected = ObjectRecordForSelect & {
  selected: boolean;
};

export const objectRecordMultiSelectFamilyState = createFamilyState<
  ObjectRecordAndSelected | undefined,
  string
>({
  key: 'objectRecordMultiSelectFamilyState',
  defaultValue: undefined,
});
