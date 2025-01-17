import { RecordComponentInstanceContext } from '@/object-record/states/contexts/RecordComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const isRecordEditableNameRenamingComponentState =
  createComponentStateV2<boolean>({
    key: 'isRecordEditableNameRenamingComponentState',
    defaultValue: false,
    componentInstanceContext: RecordComponentInstanceContext,
  });
