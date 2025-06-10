import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';
import { SearchRecord } from '~/generated-metadata/graphql';

export const searchRecordStoreComponentFamilyState =
  createComponentFamilyStateV2<
    (SearchRecord & { record?: ObjectRecord }) | undefined,
    string
  >({
    key: 'searchRecordStoreComponentFamilyState',
    defaultValue: undefined,
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  });
