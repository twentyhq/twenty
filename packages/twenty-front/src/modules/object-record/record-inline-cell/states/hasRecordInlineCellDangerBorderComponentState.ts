import { RecordInlineCellComponentInstanceContext } from '@/object-record/record-inline-cell/contexts/RecordInlineCellComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const hasRecordInlineCellDangerBorderComponentState =
  createComponentStateV2<boolean>({
    key: 'hasRecordInlineCellDangerBorderComponentState',
    defaultValue: false,
    componentInstanceContext: RecordInlineCellComponentInstanceContext,
  });
