import { ObjectRecordForSelect } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export type ObjectRecordAndSelected = ObjectRecordForSelect & {
  selected: boolean;
};

export const objectRecordMultiSelectComponentFamilyState =
  createComponentFamilyState<ObjectRecordAndSelected | undefined, string>({
    key: 'objectRecordMultiSelectComponentFamilyState',
    defaultValue: undefined,
  });
