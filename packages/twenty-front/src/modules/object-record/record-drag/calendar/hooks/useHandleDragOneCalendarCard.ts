import { type DropResult } from '@hello-pangea/dnd';
import { useRecoilCallback } from 'recoil';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';
import { extractRecordPositions } from '@/object-record/record-drag/shared/utils/extractRecordPositions';
import { isFieldDateTime } from '@/object-record/record-field/ui/types/guards/isFieldDateTime';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { computeNewPositionOfDraggedRecord } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import {
  formatISO,
  getHours,
  getMilliseconds,
  getMinutes,
  getSeconds,
  parse,
  set,
} from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

export const useHandleDragOneCalendarCard = () => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();
  const { currentView } = useGetCurrentViewOnly();
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const calendarDayRecordIdsSelector = useRecoilComponentCallbackState(
    calendarDayRecordIdsComponentFamilySelector,
  );

  const processDragOperation = useRecoilCallback(
    ({ snapshot }) =>
      async (result: DropResult) => {
        if (!result.destination || !currentView?.calendarFieldMetadataId)
          return;

        const { draggableId: recordId } = result;
        const destinationDate = result.destination.droppableId;
        const destinationIndex = result.destination.index;

        const record = snapshot
          .getLoadable(recordStoreFamilyState(recordId))
          .getValue();

        if (!record) return;

        const calendarFieldMetadata = objectMetadataItem.fields.find(
          (field) => field.id === currentView.calendarFieldMetadataId,
        );

        if (!calendarFieldMetadata) return;

        const destinationRecordIds = snapshot
          .getLoadable(calendarDayRecordIdsSelector(destinationDate))
          .getValue() as string[];

        const targetDayIsEmpty = destinationRecordIds.length === 0;

        let newPosition: number;

        if (targetDayIsEmpty) {
          newPosition = 1;
        } else {
          const recordsWithPosition = extractRecordPositions(
            destinationRecordIds,
            snapshot,
          );

          const isDroppedAfterList =
            destinationIndex >= recordsWithPosition.length;

          const targetRecord = isDroppedAfterList
            ? recordsWithPosition.at(-1)
            : recordsWithPosition.at(destinationIndex);

          if (!isDefined(targetRecord)) {
            throw new Error(
              `targetRecord cannot be found in passed recordsWithPosition, this should not happen.`,
            );
          }

          newPosition = computeNewPositionOfDraggedRecord({
            arrayOfRecordsWithPosition: recordsWithPosition,
            idOfItemToMove: recordId,
            idOfTargetItem: targetRecord.id,
          });
        }

        const targetDate = parse(destinationDate, 'yyyy-MM-dd', new Date());
        const currentFieldValue = record[calendarFieldMetadata.name];
        let newDate: Date;

        if (
          isDefined(currentFieldValue) &&
          isFieldDateTime(calendarFieldMetadata)
        ) {
          const currentDateTime = new Date(currentFieldValue);
          newDate = set(targetDate, {
            hours: getHours(currentDateTime),
            minutes: getMinutes(currentDateTime),
            seconds: getSeconds(currentDateTime),
            milliseconds: getMilliseconds(currentDateTime),
          });
        } else {
          newDate = targetDate;
        }

        await updateOneRecord({
          idToUpdate: recordId,
          updateOneRecordInput: {
            [calendarFieldMetadata.name]: formatISO(newDate),
            position: newPosition,
          },
        });
      },
    [
      objectMetadataItem,
      currentView,
      updateOneRecord,
      calendarDayRecordIdsSelector,
    ],
  );

  return {
    processDragOperation,
  };
};
