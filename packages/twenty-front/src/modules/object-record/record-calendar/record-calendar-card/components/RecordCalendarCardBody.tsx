import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { recordCalendarCardHoverPositionComponentState } from '@/object-record/record-calendar/record-calendar-card/states/recordCalendarCardHoverPositionComponentState';
import { getRecordCalendarCardInstanceIdPrefix } from '@/object-record/record-calendar/record-calendar-card/utils/getRecordCalendarCardInstanceIdPrefix';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { RecordCardBodyContainer } from '@/object-record/record-card/components/RecordCardBodyContainer';
import { RecordCardField } from '@/object-record/record-card/components/RecordCardField';
import { useRecordCardVisibleRecordFields } from '@/object-record/record-card/hooks/useRecordCardVisibleRecordFields';
import {
  type RecordUpdateHook,
  type RecordUpdateHookParams,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { themeCssVariables } from 'twenty-ui/theme';

type RecordCalendarCardBodyProps = {
  recordId: string;
  calendarDay: string;
  isRecordReadOnly: boolean;
};

export const RecordCalendarCardBody = ({
  recordId,
  calendarDay,
  isRecordReadOnly,
}: RecordCalendarCardBodyProps) => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();

  const cardInstanceIdPrefix =
    getRecordCalendarCardInstanceIdPrefix(calendarDay);

  const { updateOneRecord } = useUpdateOneRecord();

  const useUpdateOneRecordHook: RecordUpdateHook = () => {
    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord({
        objectNameSingular: objectMetadataItem.nameSingular,
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };

  const visibleRecordFields = useRecordCardVisibleRecordFields();

  const setRecordCalendarCardHoverPosition = useSetAtomComponentState(
    recordCalendarCardHoverPositionComponentState,
  );

  return (
    <RecordCardBodyContainer
      padding={`0 ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[1]}`}
    >
      {visibleRecordFields.map((recordField, index) => (
        <StopPropagationContainer key={recordField.id}>
          <RecordCardField
            recordField={recordField}
            recordId={recordId}
            isRecordReadOnly={isRecordReadOnly}
            cardInstanceIdPrefix={cardInstanceIdPrefix}
            useUpdateRecord={useUpdateOneRecordHook}
            onMouseEnter={() => setRecordCalendarCardHoverPosition(index)}
          />
        </StopPropagationContainer>
      ))}
    </RecordCardBodyContainer>
  );
};
