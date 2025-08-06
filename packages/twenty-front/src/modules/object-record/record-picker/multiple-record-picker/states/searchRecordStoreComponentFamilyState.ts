import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';
import { SearchRecord } from '~/generated-metadata/graphql';

export const searchRecordStoreComponentFamilyState = createComponentFamilyState<
  (SearchRecord & { record?: ObjectRecord }) | undefined,
  string
>({
  key: 'searchRecordStoreComponentFamilyState',
  defaultValue: undefined,
  componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
});
