import { RecordComponentInstanceContext } from '@/object-record/states/contexts/RecordComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const isUpdatingRecordEditableName = createComponentStateV2<boolean>({
  key: 'isUpdatingRecordEditableName',
  defaultValue: false,
  componentInstanceContext: RecordComponentInstanceContext,
});
