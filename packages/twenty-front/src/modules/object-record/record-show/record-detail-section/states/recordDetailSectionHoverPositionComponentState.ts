import { RecordDetailSectionComponentInstanceContext } from '@/object-record/record-show/record-detail-section/states/contexts/RecordDetailSectionComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordDetailSectionHoverPositionComponentState =
  createComponentState<number | null>({
    key: 'recordDetailSectionHoverPositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordDetailSectionComponentInstanceContext,
  });
