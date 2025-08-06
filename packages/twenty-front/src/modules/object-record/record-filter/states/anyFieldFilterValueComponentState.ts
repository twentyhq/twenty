import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const anyFieldFilterValueComponentState = createComponentState<string>({
  key: 'anyFieldFilterValueComponentState',
  defaultValue: '',
  componentInstanceContext: RecordFiltersComponentInstanceContext,
});
