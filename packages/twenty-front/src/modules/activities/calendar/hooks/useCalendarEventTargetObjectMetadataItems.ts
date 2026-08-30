import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectMorphJunctionConfig } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useCalendarEventTargetObjectMetadataItems = () => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const junctionConfig = useObjectMorphJunctionConfig({
    objectNameSingular: CoreObjectNameSingular.CalendarEvent,
  });

  return (junctionConfig?.targetFields.at(0)?.morphRelations ?? [])
    .map(({ targetObjectMetadata }) =>
      objectMetadataItems.find(({ id }) => id === targetObjectMetadata.id),
    )
    .filter(isDefined);
};
