import { RecordTableCellComponentInstanceContext } from '@/object-record/record-table/contexts/RecordTableCellComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const hasRecordTableCellDangerBorderComponentState =
  createComponentStateV2<boolean>({
    key: 'hasRecordTableCellDangerBorderComponentState',
    defaultValue: false,
    componentInstanceContext: RecordTableCellComponentInstanceContext,
  });
