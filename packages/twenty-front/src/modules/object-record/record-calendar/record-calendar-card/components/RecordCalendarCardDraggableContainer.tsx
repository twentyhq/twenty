import { styled } from '@linaria/react';

import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isFieldMetadataReadOnlyByPermissions } from '@/object-record/read-only/utils/internal/isFieldMetadataReadOnlyByPermissions';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RECORD_CALENDAR_CARD_DND_TYPE } from '@/object-record/record-calendar/record-calendar-dnd/constants/RecordCalendarCardDndType';
import { RecordCalendarCard } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCard';
import { RecordCalendarCardComponentInstanceContext } from '@/object-record/record-calendar/record-calendar-card/states/contexts/RecordCalendarCardComponentInstanceContext';
import { recordIndexCalendarFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdState';
import { DragDropColumnSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropColumnSortableCell';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

const StyledDraggableContainer = styled.div`
  position: relative;
  scroll-margin-left: 8px;
  scroll-margin-right: 8px;
  scroll-margin-top: 8px;
`;

export const RecordCalendarCardDraggableContainer = ({
  recordId,
  index,
  group,
}: {
  recordId: string;
  index: number;
  group: string;
}) => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();

  const recordIsReadOnly = useIsRecordReadOnly({
    recordId,
    objectMetadataId: objectMetadataItem.id,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const recordIndexCalendarFieldMetadataId = useAtomStateValue(
    recordIndexCalendarFieldMetadataIdState,
  );

  const calendarFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexCalendarFieldMetadataId,
  );

  const calendarFieldMetadataItemIsUIReadOnly =
    calendarFieldMetadataItem?.isUIEditable === false;

  const calendarFieldMetadataItemIsRestrictedForUpdate = isDefined(
    calendarFieldMetadataItem,
  )
    ? isFieldMetadataReadOnlyByPermissions({
        objectPermissions,
        fieldMetadataId: calendarFieldMetadataItem.id,
      })
    : false;

  const calendarFieldMetadataItemIsReadOnly =
    calendarFieldMetadataItemIsUIReadOnly ||
    calendarFieldMetadataItemIsRestrictedForUpdate;

  const dragIsDisabled =
    recordIsReadOnly || calendarFieldMetadataItemIsReadOnly;

  return (
    <RecordCalendarCardComponentInstanceContext.Provider
      value={{ instanceId: recordId }}
    >
      <DragDropColumnSortableCell
        id={recordId}
        index={index}
        group={group}
        type={RECORD_CALENDAR_CARD_DND_TYPE}
        accept={RECORD_CALENDAR_CARD_DND_TYPE}
        disabled={dragIsDisabled}
      >
        <StyledDraggableContainer
          id={`record-calendar-card-${recordId}`}
          data-selectable-id={recordId}
        >
          <RecordCalendarCard recordId={recordId} />
        </StyledDraggableContainer>
      </DragDropColumnSortableCell>
    </RecordCalendarCardComponentInstanceContext.Provider>
  );
};
