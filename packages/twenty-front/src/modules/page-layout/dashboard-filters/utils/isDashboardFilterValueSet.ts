import { type DashboardFilterValue } from 'twenty-shared/types';
import { isDefined, isRecordFilterValueValid } from 'twenty-shared/utils';

// Same predicate as the merge: a value that would not filter counts as unset.
export const isDashboardFilterValueSet = (
  value: DashboardFilterValue | undefined,
): value is DashboardFilterValue =>
  isDefined(value) && isRecordFilterValueValid(value);
