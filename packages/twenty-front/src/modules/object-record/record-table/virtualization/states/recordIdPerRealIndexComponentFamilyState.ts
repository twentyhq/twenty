import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const recordIdPerRealIndexComponentFamilyState =
  createComponentFamilyState<string | null, number>({
    key: 'recordIdPerRealIndexComponentFamilyState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: null,
  });
