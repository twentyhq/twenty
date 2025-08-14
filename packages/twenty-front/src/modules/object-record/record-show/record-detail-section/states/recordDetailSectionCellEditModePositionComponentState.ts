import { RecordDetailSectionComponentInstanceContext } from '@/object-record/record-show/record-detail-section/states/contexts/RecordDetailSectionComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordDetailSectionCellEditModePositionComponentState =
  createComponentState<number | null>({
    key: 'recordDetailSectionCellEditModePositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordDetailSectionComponentInstanceContext,
  });
