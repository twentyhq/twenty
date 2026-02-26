import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const anyFieldFilterValueComponentState =
  createAtomComponentState<string>({
    key: 'anyFieldFilterValueComponentState',
    defaultValue: '',
    componentInstanceContext: RecordFiltersComponentInstanceContext,
  });
