import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const canReadTimelineObjects = ({
  timelineObjectNamesSingular,
  objectIdByNameSingular,
  objectRecordsPermissions,
}: {
  timelineObjectNamesSingular: string[];
  objectIdByNameSingular: Record<string, string>;
  objectRecordsPermissions: ObjectsPermissions;
}): boolean =>
  timelineObjectNamesSingular.every((timelineObjectNameSingular) => {
    const objectMetadataId = objectIdByNameSingular[timelineObjectNameSingular];

    return (
      isDefined(objectMetadataId) &&
      objectRecordsPermissions[objectMetadataId]?.canReadObjectRecords === true
    );
  });
