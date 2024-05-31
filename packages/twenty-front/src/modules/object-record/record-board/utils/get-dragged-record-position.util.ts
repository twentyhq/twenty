import { isDefined } from '~/utils/isDefined';

export const getDraggedRecordPosition = (
  recordBeforePosition?: number,
  recordAfterPosition?: number,
): number => {
  if (isDefined(recordAfterPosition) && isDefined(recordBeforePosition)) {
    return (recordBeforePosition + recordAfterPosition) / 2;
  } else if (isDefined(recordAfterPosition)) {
    return recordAfterPosition - 1;
  } else if (isDefined(recordBeforePosition)) {
    return recordBeforePosition + 1;
  } else {
    return 1;
  }
};
