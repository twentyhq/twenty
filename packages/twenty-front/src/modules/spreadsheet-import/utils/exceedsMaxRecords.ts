import { isDefined } from 'twenty-shared/utils';
import { type WorkSheet } from 'xlsx-ugnis';

export const exceedsMaxRecords = (
  workSheet: WorkSheet | undefined,
  maxRecords: number,
) => {
  const [top, bottom] =
    workSheet?.['!ref']
      ?.split(':')
      .map((position) => parseInt(position.replace(/\D/g, ''), 10)) ?? [];

  if (!isDefined(top) || !isDefined(bottom)) {
    return false;
  }

  return bottom - top > maxRecords;
};
