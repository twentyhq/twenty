import { RecordBoardCardComponentInstanceContext } from '@/object-record/record-board/record-board-card/states/contexts/RecordBoardCardComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordBoardCardHoverPositionComponentState = createComponentState<
  number | null
>({
  key: 'recordBoardCardHoverPositionComponentState',
  defaultValue: null,
  componentInstanceContext: RecordBoardCardComponentInstanceContext,
});
