import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardCardCellEditModePortal } from '@/object-record/record-board/record-board-card/anchored-portal/components/RecordBoardCardCellEditModePortal';
import { RecordBoardCardCellHoveredPortal } from '@/object-record/record-board/record-board-card/anchored-portal/components/RecordBoardCardCellHoveredPortal';
import { RecordBoardCardBody } from '@/object-record/record-board/record-board-card/components/RecordBoardCardBody';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { RecordBoardCardComponentInstanceContext } from '@/object-record/record-board/record-board-card/states/contexts/RecordBoardCardComponentInstanceContext';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { RecordCalendarContextProvider } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCalendarCardCellEditModePortal } from '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardCellEditModePortal';
import { RecordCalendarCardCellHoveredPortal } from '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardCellHoveredPortal';
import { RecordCalendarCardBody } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardBody';
import { RecordCalendarCardComponentInstanceContext } from '@/object-record/record-calendar/record-calendar-card/states/contexts/RecordCalendarCardComponentInstanceContext';
import { ON_DEMAND_FIELD_STORY_RECORD_FIELDS } from '@/object-record/record-field/on-demand/testing/seedOnDemandCollectionFieldStory';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';

type OnDemandRecordCardStoryProps = {
  surface: 'board' | 'calendar';
  recordId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const OnDemandRecordCardStory = ({
  surface,
  recordId,
  objectMetadataItem,
}: OnDemandRecordCardStoryProps) => {
  const { updateOneRecord } = useUpdateOneRecord();
  const objectPermissions = getObjectPermissionsForObject(
    {},
    objectMetadataItem.id,
  );

  if (surface === 'calendar') {
    return (
      <RecordCalendarContextProvider
        value={{
          viewBarInstanceId: 'on-demand-story',
          objectNameSingular: objectMetadataItem.nameSingular,
          objectMetadataItem,
          objectPermissions,
          visibleRecordFields: ON_DEMAND_FIELD_STORY_RECORD_FIELDS,
        }}
      >
        <RecordCalendarCardComponentInstanceContext.Provider
          value={{ instanceId: 'on-demand-calendar-card' }}
        >
          <RecordCalendarCardBody
            recordId={recordId}
            calendarDay="2026-10-08"
            isRecordReadOnly={false}
          />
          <RecordCalendarCardCellHoveredPortal
            recordId={recordId}
            calendarDay="2026-10-08"
          />
          <RecordCalendarCardCellEditModePortal
            recordId={recordId}
            calendarDay="2026-10-08"
          />
        </RecordCalendarCardComponentInstanceContext.Provider>
      </RecordCalendarContextProvider>
    );
  }

  return (
    <RecordBoardComponentInstanceContext.Provider
      value={{ instanceId: 'on-demand-story' }}
    >
      <RecordBoardContext.Provider
        value={{
          objectMetadataItem,
          selectFieldMetadataItem: getMockFieldMetadataItemOrThrow({
            objectMetadataItem,
            fieldName: 'status',
          }),
          createOneRecord: () => {},
          updateOneRecord: (input) => {
            void updateOneRecord({
              objectNameSingular: objectMetadataItem.nameSingular,
              ...input,
            });
          },
          deleteOneRecord: async () => {},
          recordBoardId: 'on-demand-story',
          objectPermissions,
        }}
      >
        <RecordBoardCardComponentInstanceContext.Provider
          value={{ instanceId: 'on-demand-board-card' }}
        >
          <RecordBoardCardContext.Provider
            value={{
              recordId,
              isRecordReadOnly: false,
              rowIndex: 0,
              columnIndex: 0,
            }}
          >
            <RecordBoardCardBody />
            <RecordBoardCardCellHoveredPortal />
            <RecordBoardCardCellEditModePortal />
          </RecordBoardCardContext.Provider>
        </RecordBoardCardComponentInstanceContext.Provider>
      </RecordBoardContext.Provider>
    </RecordBoardComponentInstanceContext.Provider>
  );
};
