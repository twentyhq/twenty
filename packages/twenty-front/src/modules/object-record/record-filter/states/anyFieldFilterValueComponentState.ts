import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const anyFieldFilterValueComponentState = createComponentStateV2<string>(
  {
    key: 'anyFieldFilterValueComponentState',
    defaultValue: '',
    componentInstanceContext: RecordFiltersComponentInstanceContext,
  },
);
