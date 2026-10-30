import { type LinkedinImportRange } from 'src/types/linkedin-import-range.type';

// null imports the whole history
export const LINKEDIN_IMPORT_RANGE_DAYS: Record<
  LinkedinImportRange,
  number | null
> = {
  LAST_30_DAYS: 30,
  LAST_90_DAYS: 90,
  LAST_365_DAYS: 365,
  ALL: null,
};
