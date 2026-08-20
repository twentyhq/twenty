import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCalendarCardInputContextProvider } from '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardInputContextProvider';
import { useRecordCalendarCardMetadataFromPosition } from '@/object-record/record-calendar/record-calendar-card/hooks/useRecordCalendarCardMetadataFromPosition';
import { recordCalendarCardEditModePositionComponentState } from '@/object-record/record-calendar/record-calendar-card/states/recordCalendarCardEditModePositionComponentState';
import { getRecordCalendarCardInstanceIdPrefix } from '@/object-record/record-calendar/record-calendar-card/utils/getRecordCalendarCardInstanceIdPrefix';
import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import { isDefined } from 'twenty-shared/utils';

type RecordCalendarCardCellEditModePortalProps = {
  recordId: string;
  calendarDay: string;
};

export const RecordCalendarCardCellEditModePortal = ({
  recordId,
  calendarDay,
}: RecordCalendarCardCellEditModePortalProps) => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();

  const recordCalendarCardEditModePosition = useAtomComponentStateValue(
    recordCalendarCardEditModePositionComponentState,
  );

  const { editedFieldMetadataItem } =
    useRecordCalendarCardMetadataFromPosition();

  if (
    !isDefined(recordCalendarCardEditModePosition) ||
    !isDefined(editedFieldMetadataItem)
  ) {
    return null;
  }

  return (
    <RecordInlineCellAnchoredPortal
      fieldMetadataItem={editedFieldMetadataItem}
      objectMetadataItem={objectMetadataItem}
      recordId={recordId}
      instanceIdPrefix={getRecordCalendarCardInstanceIdPrefix(calendarDay)}
    >
      <RecordCalendarCardInputContextProvider>
        <RecordInlineCellEditMode>
          <FieldInput />
        </RecordInlineCellEditMode>
      </RecordCalendarCardInputContextProvider>
    </RecordInlineCellAnchoredPortal>
  );
};
