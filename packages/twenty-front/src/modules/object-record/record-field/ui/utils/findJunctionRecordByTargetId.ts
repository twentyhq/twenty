import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

type FindJunctionRecordByTargetIdArgs = {
  junctionRecords: ObjectRecord[];
  targetRecordId: string;
  targetFieldName: string;
};

export const findJunctionRecordByTargetId = ({
  junctionRecords,
  targetRecordId,
  targetFieldName,
}: FindJunctionRecordByTargetIdArgs): ObjectRecord | undefined => {
  for (const junctionRecord of junctionRecords) {
    if (!isDefined(junctionRecord)) {
      continue;
    }

    const targetObject = junctionRecord[targetFieldName];

    if (
      isDefined(targetObject) &&
      typeof targetObject === 'object' &&
      'id' in targetObject &&
      (targetObject as { id: string }).id === targetRecordId
    ) {
      return junctionRecord;
    }
  }

  return undefined;
};
