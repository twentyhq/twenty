import { ObjectRecordForSelect } from '@/object-record/types/ObjectRecordForSelect';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export type ObjectRecordAndSelected = ObjectRecordForSelect & {
  selected: boolean;
};

export const objectRecordMultiSelectComponentFamilyState =
  createComponentFamilyState<ObjectRecordAndSelected | undefined, string>({
    key: 'objectRecordMultiSelectComponentFamilyState',
    defaultValue: undefined,
  });
