import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const isSoftDeleteFilterActiveComponentState =
  createComponentStateV2<boolean>({
    key: 'isSoftDeleteFilterActiveComponentState',
    defaultValue: false,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
