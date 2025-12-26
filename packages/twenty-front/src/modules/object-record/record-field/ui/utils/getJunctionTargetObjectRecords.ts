import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

export type JunctionTargetRecord = {
  junctionRecord: ObjectRecord;
  targetObject: ObjectRecord;
  targetObjectMetadataItem: ObjectMetadataItem;
};

type GetJunctionTargetObjectRecordsArgs = {
  junctionRecords: ObjectRecord[];
  objectMetadataItems: ObjectMetadataItem[];
  // Objects to exclude from the target (e.g., the source object)
  excludeObjectNamesSingular?: string[];
};

// Extracts target objects from junction records by finding related objects
// This is a generic version of getActivityTargetObjectRecords
export const getJunctionTargetObjectRecords = ({
  junctionRecords,
  objectMetadataItems,
  excludeObjectNamesSingular = [],
}: GetJunctionTargetObjectRecordsArgs): JunctionTargetRecord[] => {
  return junctionRecords
    .map((junctionRecord) => {
      if (!isDefined(junctionRecord)) {
        return undefined;
      }

      // Find the first object metadata item that has a corresponding property in the junction record
      const correspondingObjectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          isDefined(junctionRecord[objectMetadataItem.nameSingular]) &&
          !excludeObjectNamesSingular.includes(objectMetadataItem.nameSingular),
      );

      if (!correspondingObjectMetadataItem) {
        return undefined;
      }

      const targetObject = junctionRecord[
        correspondingObjectMetadataItem.nameSingular
      ] as ObjectRecord | undefined;

      if (!isDefined(targetObject)) {
        return undefined;
      }

      return {
        junctionRecord,
        targetObject,
        targetObjectMetadataItem: correspondingObjectMetadataItem,
      };
    })
    .filter(isDefined);
};

