import { RecordTitleCellComponentInstanceContext } from '@/object-record/record-title-cell/states/contexts/RecordTitleCellComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const isTitleCellInEditModeComponentState =
  createAtomComponentState<boolean>({
    key: 'isTitleCellInEditModeComponentState',
    defaultValue: false,
    componentInstanceContext: RecordTitleCellComponentInstanceContext,
  });
