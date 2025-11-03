import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCalendarCardInputContextProvider } from '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardInputContextProvider';
import { RECORD_CALENDAR_CARD_INPUT_ID_PREFIX } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardInputIdPrefix';
import { useRecordCalendarCardMetadataFromPosition } from '@/object-record/record-calendar/record-calendar-card/hooks/useRecordCalendarCardMetadataFromPosition';
import { recordCalendarCardEditModePositionComponentState } from '@/object-record/record-calendar/record-calendar-card/states/recordCalendarCardEditModePositionComponentState';
import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import { isDefined } from 'twenty-shared/utils';

type RecordCalendarCardCellEditModePortalProps = {
  recordId: string;
};

export const RecordCalendarCardCellEditModePortal = ({
  recordId,
}: RecordCalendarCardCellEditModePortalProps) => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();

  const editModePosition = useRecoilComponentValue(
    recordCalendarCardEditModePositionComponentState,
  );

  const { editedFieldMetadataItem } =
    useRecordCalendarCardMetadataFromPosition();

  if (!isDefined(editModePosition) || !isDefined(editedFieldMetadataItem)) {
    return null;
  }

  return (
    <RecordInlineCellAnchoredPortal
      fieldMetadataItem={editedFieldMetadataItem}
      objectMetadataItem={objectMetadataItem}
      recordId={recordId}
      instanceIdPrefix={RECORD_CALENDAR_CARD_INPUT_ID_PREFIX}
    >
      <RecordCalendarCardInputContextProvider>
        <RecordInlineCellEditMode>
          <FieldInput />
        </RecordInlineCellEditMode>
      </RecordCalendarCardInputContextProvider>
    </RecordInlineCellAnchoredPortal>
  );
};
