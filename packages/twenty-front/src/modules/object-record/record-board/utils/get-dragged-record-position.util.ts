import { isDefined } from '~/utils/isDefined';

export const getDraggedRecordPosition = (
  recordBeforePosition?: number,
  recordAfterPosition?: number,
): number => {
  if (isDefined(recordAfterPosition) && isDefined(recordBeforePosition)) {
    return (recordBeforePosition + recordAfterPosition) / 2;
  }

  if (isDefined(recordAfterPosition)) {
    return recordAfterPosition - 1;
  }

  if (isDefined(recordBeforePosition)) {
    return recordBeforePosition + 1;
  }

  return 1;
};
