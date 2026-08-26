import { type ActivityTarget } from '@/activities/types/ActivityTarget';
import { type Note } from '@/activities/types/Note';
import { type Task } from '@/activities/types/Task';

const hasField = <FieldName extends string>(
  record: object,
  fieldName: FieldName,
): record is Record<FieldName, unknown> => fieldName in record;

const isActivityTarget = (value: unknown): value is ActivityTarget =>
  typeof value === 'object' &&
  value !== null &&
  hasField(value, 'id') &&
  typeof value.id === 'string';

const isActivity = (value: unknown): value is Task | Note =>
  isActivityTarget(value) &&
  hasField(value, '__typename') &&
  (value.__typename === 'Task' || value.__typename === 'Note');

export const getActivityTargetsFromRecord = ({
  record,
  fieldName,
}: {
  record: object;
  fieldName: string;
}): ActivityTarget[] => {
  if (!hasField(record, fieldName)) {
    return [];
  }

  const fieldValue = record[fieldName];

  return Array.isArray(fieldValue) ? fieldValue.filter(isActivityTarget) : [];
};

export const getActivityFromTarget = ({
  activityTarget,
  relationFieldName,
}: {
  activityTarget: ActivityTarget;
  relationFieldName: string;
}): Task | Note | undefined => {
  if (!hasField(activityTarget, relationFieldName)) {
    return undefined;
  }

  const fieldValue = activityTarget[relationFieldName];

  return isActivity(fieldValue) ? fieldValue : undefined;
};

export const getActivityIdFromTarget = ({
  activityTarget,
  relationFieldName,
  relationFieldIdName,
}: {
  activityTarget: ActivityTarget;
  relationFieldName: string;
  relationFieldIdName: string;
}): string | undefined => {
  if (hasField(activityTarget, relationFieldIdName)) {
    const relationId = activityTarget[relationFieldIdName];

    if (typeof relationId === 'string') {
      return relationId;
    }
  }

  return getActivityFromTarget({
    activityTarget,
    relationFieldName,
  })?.id;
};
