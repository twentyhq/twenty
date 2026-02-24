import { RecordTitleCellComponentInstanceContext } from '@/object-record/record-title-cell/states/contexts/RecordTitleCellComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const isTitleCellInEditModeComponentState =
  createComponentStateV2<boolean>({
    key: 'isTitleCellInEditModeComponentState',
    defaultValue: false,
    componentInstanceContext: RecordTitleCellComponentInstanceContext,
  });
