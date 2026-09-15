import { type CalendarEventComposerTarget } from '@/activities/calendar/types/CalendarEventComposerTarget';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useObjectMorphJunctionConfig } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig';
import { findTargetFieldInfo } from '@/object-record/record-field/ui/utils/junction/findTargetFieldInfo';
import { useCallback } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useCreateCalendarEventTargets = () => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const junctionConfig = useObjectMorphJunctionConfig({
    objectNameSingular: CoreObjectNameSingular.CalendarEvent,
  });

  const { createManyRecords: createCalendarEventTargetRecords } =
    useCreateManyRecords({
      // Workspaces that predate the junction have no calendarEventTarget object
      // and resolving one throws, so this falls back to the calendar event
      // itself; without a junction config nothing is ever written.
      objectNameSingular:
        junctionConfig?.junctionObjectMetadata.nameSingular ??
        CoreObjectNameSingular.CalendarEvent,
    });

  const createCalendarEventTargets = useCallback(
    async ({
      calendarEventId,
      targets,
    }: {
      calendarEventId: string;
      targets: CalendarEventComposerTarget[];
    }) => {
      if (!isDefined(junctionConfig)) {
        return;
      }

      const recordsToCreate = targets.flatMap(
        ({ objectMetadataId, recordId }) => {
          const targetFieldInfo = findTargetFieldInfo(
            junctionConfig.targetFields,
            objectMetadataId,
            objectMetadataItems,
          );

          if (!isDefined(targetFieldInfo?.joinColumnName)) {
            return [];
          }

          return [
            {
              [junctionConfig.sourceJoinColumnName]: calendarEventId,
              [targetFieldInfo.joinColumnName]: recordId,
            },
          ];
        },
      );

      if (recordsToCreate.length === 0) {
        return;
      }

      // Participant matching already linked the guests it resolved, including
      // the record the composer was opened from, so these rows can collide with
      // the junction's unique indexes. Upsert resolves against them.
      await createCalendarEventTargetRecords({ recordsToCreate, upsert: true });
    },
    [createCalendarEventTargetRecords, junctionConfig, objectMetadataItems],
  );

  return { createCalendarEventTargets };
};
