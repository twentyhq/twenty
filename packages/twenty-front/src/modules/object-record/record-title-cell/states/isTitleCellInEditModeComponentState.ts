import { RecordTitleCellComponentInstanceContext } from '@/object-record/record-title-cell/states/contexts/RecordTitleCellComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isTitleCellInEditModeComponentState =
  createComponentState<boolean>({
    key: 'isTitleCellInEditModeComponentState',
    defaultValue: false,
    componentInstanceContext: RecordTitleCellComponentInstanceContext,
  });
