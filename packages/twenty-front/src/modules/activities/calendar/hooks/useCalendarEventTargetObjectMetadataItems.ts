import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectMorphJunctionConfig } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig';
import { getSearchableObjectMetadataItems } from '@/object-record/record-field/ui/utils/junction/getSearchableObjectMetadataItems';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const useCalendarEventTargetObjectMetadataItems = () => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const junctionConfig = useObjectMorphJunctionConfig({
    objectNameSingular: CoreObjectNameSingular.CalendarEvent,
  });

  return getSearchableObjectMetadataItems(
    junctionConfig?.targetFields ?? [],
    objectMetadataItems,
  );
};
