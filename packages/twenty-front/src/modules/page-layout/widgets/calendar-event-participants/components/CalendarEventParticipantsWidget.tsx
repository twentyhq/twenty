import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { generateJunctionRelationGqlFields } from '@/object-record/graphql/record-gql-fields/utils/generateJunctionRelationGqlFields';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { FieldWidgetJunctionRelationField } from '@/page-layout/widgets/field/components/FieldWidgetJunctionRelationField';
import { resolveFieldWidgetJunctionConfig } from '@/page-layout/widgets/field/utils/resolveFieldWidgetJunctionConfig';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Participants stay owned by the calendar event; a call recording reads them
// through its calendarEvent relation instead of keeping its own copy
export const CalendarEventParticipantsWidget = () => {
  const targetRecord = useTargetRecord();
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectMetadataItem: calendarEventObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.CalendarEvent,
    });

  const participantsFieldMetadataItem =
    calendarEventObjectMetadataItem.fields.find(
      (field) => field.name === 'calendarEventParticipants',
    );

  const junctionConfig = isDefined(participantsFieldMetadataItem)
    ? resolveFieldWidgetJunctionConfig({
        fieldMetadataItem: participantsFieldMetadataItem,
        objectMetadataItems,
      })
    : null;

  const usableJunctionConfig = isUsableJunctionConfig(junctionConfig)
    ? junctionConfig
    : undefined;

  const participantsRecordGqlFields = isDefined(usableJunctionConfig)
    ? generateJunctionRelationGqlFields({
        junctionConfig: usableJunctionConfig,
        objectMetadataItems,
      })
    : {};

  const isCallRecordingTarget =
    targetRecord.targetObjectNameSingular ===
    CoreObjectNameSingular.CallRecording;
  const isCalendarEventTarget =
    targetRecord.targetObjectNameSingular ===
    CoreObjectNameSingular.CalendarEvent;

  const { record } = useFindOneRecord({
    objectNameSingular: targetRecord.targetObjectNameSingular,
    objectRecordId: targetRecord.id,
    recordGqlFields: isCallRecordingTarget
      ? {
          id: true,
          calendarEvent: {
            id: true,
            calendarEventParticipants: participantsRecordGqlFields,
          },
        }
      : { id: true, calendarEventParticipants: participantsRecordGqlFields },
    skip:
      !isDefined(usableJunctionConfig) ||
      (!isCallRecordingTarget && !isCalendarEventTarget),
  });

  if (!isDefined(usableJunctionConfig) || !isDefined(record)) {
    return null;
  }

  const participants = isCallRecordingTarget
    ? record.calendarEvent?.calendarEventParticipants
    : record.calendarEventParticipants;

  return (
    <FieldWidgetJunctionRelationField
      relationValue={participants}
      isInSidePanel={isInSidePanel}
      junctionConfig={usableJunctionConfig}
    />
  );
};
