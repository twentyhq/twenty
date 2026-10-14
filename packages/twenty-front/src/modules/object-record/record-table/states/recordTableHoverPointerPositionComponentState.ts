import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type OverflowingTextWithTooltipProps } from 'twenty-ui/primitives/typography';

export const recordTableHoverPointerPositionComponentState =
  createAtomComponentState<NonNullable<
    OverflowingTextWithTooltipProps['initialPointerPosition']
  > | null>({
    key: 'recordTableHoverPointerPositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
