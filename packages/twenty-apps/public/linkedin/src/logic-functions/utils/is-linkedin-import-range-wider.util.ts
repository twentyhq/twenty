import { LINKEDIN_IMPORT_RANGE_DAYS } from 'src/constants/linkedin-import-range-days.constant';
import { type LinkedinImportRange } from 'src/types/linkedin-import-range.type';

export const isLinkedinImportRangeWider = ({
  importRange,
  than,
}: {
  importRange: LinkedinImportRange;
  than: LinkedinImportRange;
}): boolean => {
  const days = LINKEDIN_IMPORT_RANGE_DAYS[importRange];
  const otherDays = LINKEDIN_IMPORT_RANGE_DAYS[than];

  if (days === null) {
    return otherDays !== null;
  }

  return otherDays !== null && days > otherDays;
};
