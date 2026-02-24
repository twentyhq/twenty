import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const shouldCompactRecordTableFirstColumnComponentState =
  createComponentStateV2<boolean>({
    key: 'shouldCompactRecordTableFirstColumnComponentState',
    defaultValue: false,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
