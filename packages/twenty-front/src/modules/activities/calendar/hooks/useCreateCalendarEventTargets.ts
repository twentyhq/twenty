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
      objectNameSingular:
        junctionConfig?.junctionObjectMetadata.nameSingular ??
        CoreObjectNameSingular.CalendarEventTarget,
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

      await createCalendarEventTargetRecords({ recordsToCreate });
    },
    [createCalendarEventTargetRecords, junctionConfig, objectMetadataItems],
  );

  return { createCalendarEventTargets };
};
