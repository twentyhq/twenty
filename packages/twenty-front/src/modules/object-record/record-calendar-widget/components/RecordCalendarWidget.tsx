import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { RecordCalendar } from '@/object-record/record-calendar/components/RecordCalendar';
import { RecordCalendarSSESubscribeEffect } from '@/object-record/record-calendar/components/RecordCalendarSSESubscribeEffect';
import { RecordIndexCalendarDataLoaderEffect } from '@/object-record/record-calendar/components/RecordIndexCalendarDataLoaderEffect';
import { RecordIndexCalendarSelectedDateInitEffect } from '@/object-record/record-calendar/components/RecordIndexCalendarSelectedDateInitEffect';
import { RecordCalendarContextProvider } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCalendarWidgetReadOnlyEffect } from '@/object-record/record-calendar-widget/components/RecordCalendarWidgetReadOnlyEffect';
import { recordIndexCalendarFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCalendarContainer = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
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

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

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
        <RecordCalendarContextProvider
          value={{
            viewBarInstanceId,
            objectNameSingular,
            visibleRecordFields: [],
            objectMetadataItem,
            objectPermissions,
          }}
        >
          <RecordCalendar />
          <RecordCalendarSSESubscribeEffect />
          <RecordIndexCalendarDataLoaderEffect />
          <RecordIndexCalendarSelectedDateInitEffect />
        </RecordCalendarContextProvider>
      </StyledCalendarContainer>
    </>
  );
};
