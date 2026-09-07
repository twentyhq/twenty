import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCalendarCardCellHoveredPortalContent } from '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardCellHoveredPortalContent';
import { RecordCalendarCardInputContextProvider } from '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardInputContextProvider';
import { useRecordCalendarCardMetadataFromPosition } from '@/object-record/record-calendar/record-calendar-card/hooks/useRecordCalendarCardMetadataFromPosition';
import { recordCalendarCardHoverPositionComponentState } from '@/object-record/record-calendar/record-calendar-card/states/recordCalendarCardHoverPositionComponentState';
import { getRecordCalendarCardInstanceIdPrefix } from '@/object-record/record-calendar/record-calendar-card/utils/getRecordCalendarCardInstanceIdPrefix';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { isDefined } from 'twenty-shared/utils';

type RecordCalendarCardCellHoveredPortalProps = {
  recordId: string;
  calendarDay: string;
};

export const RecordCalendarCardCellHoveredPortal = ({
  recordId,
  calendarDay,
}: RecordCalendarCardCellHoveredPortalProps) => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();

  const recordCalendarCardHoverPosition = useAtomComponentStateValue(
    recordCalendarCardHoverPositionComponentState,
  );

  const { hoveredFieldMetadataItem } =
    useRecordCalendarCardMetadataFromPosition();

  if (
    !isDefined(recordCalendarCardHoverPosition) ||
    !isDefined(hoveredFieldMetadataItem)
  ) {
    return null;
  }

  return (
    <RecordInlineCellAnchoredPortal
      fieldMetadataItem={hoveredFieldMetadataItem}
      objectMetadataItem={objectMetadataItem}
      recordId={recordId}
      instanceIdPrefix={getRecordCalendarCardInstanceIdPrefix(calendarDay)}
    >
      <RecordCalendarCardInputContextProvider>
        <RecordCalendarCardCellHoveredPortalContent calendarDay={calendarDay} />
      </RecordCalendarCardInputContextProvider>
    </RecordInlineCellAnchoredPortal>
  );
};
