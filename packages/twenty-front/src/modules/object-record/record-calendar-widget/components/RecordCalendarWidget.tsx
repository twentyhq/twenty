import { RecordCalendarContainer } from '@/object-record/record-calendar/components/RecordCalendarContainer';
import { RecordCalendarWidgetReadOnlyEffect } from '@/object-record/record-calendar-widget/components/RecordCalendarWidgetReadOnlyEffect';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexCalendarFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

const StyledCalendarContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

type RecordCalendarWidgetProps = {
  isReadOnly?: boolean;
};

export const RecordCalendarWidget = ({
  isReadOnly = true,
}: RecordCalendarWidgetProps) => {
  const { objectNameSingular, recordIndexId, viewBarInstanceId } =
    useRecordIndexContextOrThrow();

  // Hydrated per widget instance from the backing view (draft or persisted)
  // by the widget view load effect, so edit-mode previews work before save.
  const recordIndexCalendarFieldMetadataId = useAtomComponentStateValue(
    recordIndexCalendarFieldMetadataIdComponentState,
    recordIndexId,
  );

  if (!isDefined(recordIndexCalendarFieldMetadataId)) {
    return null;
  }

  return (
    <>
      <RecordCalendarWidgetReadOnlyEffect
        recordCalendarId={recordIndexId}
        isReadOnly={isReadOnly}
      />
      <StyledCalendarContainer>
        <RecordCalendarContainer
          objectNameSingular={objectNameSingular}
          viewBarInstanceId={viewBarInstanceId}
        />
      </StyledCalendarContainer>
    </>
  );
};
