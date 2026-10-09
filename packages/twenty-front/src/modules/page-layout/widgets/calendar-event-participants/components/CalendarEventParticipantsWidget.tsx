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
// through its calendar event instead of keeping its own copy
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

  const isCallRecordingTarget =
    targetRecord.targetObjectNameSingular ===
    CoreObjectNameSingular.CallRecording;

  const { record: callRecording } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.CallRecording,
    objectRecordId: targetRecord.id,
    recordGqlFields: { id: true, calendarEventId: true },
    skip: !isCallRecordingTarget,
  });

  const calendarEventId =
    targetRecord.targetObjectNameSingular ===
    CoreObjectNameSingular.CalendarEvent
      ? targetRecord.id
      : (callRecording?.calendarEventId ?? undefined);

  // Fetched from the calendar event itself: one-to-many relations nested under
  // a many-to-one come back empty from the API
  const { record: calendarEvent } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.CalendarEvent,
    objectRecordId: calendarEventId,
    recordGqlFields: {
      id: true,
      calendarEventParticipants: isDefined(usableJunctionConfig)
        ? generateJunctionRelationGqlFields({
            junctionConfig: usableJunctionConfig,
            objectMetadataItems,
          })
        : {},
    },
    skip: !isDefined(usableJunctionConfig),
  });

  if (!isDefined(usableJunctionConfig) || !isDefined(calendarEvent)) {
    return null;
  }

  return (
    <FieldWidgetJunctionRelationField
      relationValue={calendarEvent.calendarEventParticipants}
      isInSidePanel={isInSidePanel}
      junctionConfig={usableJunctionConfig}
    />
  );
};
