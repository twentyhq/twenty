import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCalendarCardCellHoveredPortalContent } from '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardCellHoveredPortalContent';
import { RecordCalendarCardInputContextProvider } from '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardInputContextProvider';
import { RECORD_CALENDAR_CARD_INPUT_ID_PREFIX } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardInputIdPrefix';
import { useRecordCalendarCardMetadataFromPosition } from '@/object-record/record-calendar/record-calendar-card/hooks/useRecordCalendarCardMetadataFromPosition';
import { recordCalendarCardHoverPositionComponentState } from '@/object-record/record-calendar/record-calendar-card/states/recordCalendarCardHoverPositionComponentState';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { isDefined } from 'twenty-shared/utils';

type RecordCalendarCardCellHoveredPortalProps = {
  recordId: string;
};

export const RecordCalendarCardCellHoveredPortal = ({
  recordId,
}: RecordCalendarCardCellHoveredPortalProps) => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();

  const hoverPosition = useRecoilComponentValue(
    recordCalendarCardHoverPositionComponentState,
  );

  const { hoveredFieldMetadataItem } =
    useRecordCalendarCardMetadataFromPosition();

  if (!isDefined(hoverPosition) || !isDefined(hoveredFieldMetadataItem)) {
    return null;
  }

  return (
    <RecordInlineCellAnchoredPortal
      fieldMetadataItem={hoveredFieldMetadataItem}
      objectMetadataItem={objectMetadataItem}
      recordId={recordId}
      instanceIdPrefix={RECORD_CALENDAR_CARD_INPUT_ID_PREFIX}
    >
      <RecordCalendarCardInputContextProvider>
        <RecordCalendarCardCellHoveredPortalContent />
      </RecordCalendarCardInputContextProvider>
    </RecordInlineCellAnchoredPortal>
  );
};
