import { type ObjectRecord } from 'twenty-shared/types';

import { type TrackedJobProgress } from 'src/engine/core-modules/tracked-job/types/tracked-job-progress.type';

export type TrackedJobPage = TrackedJobProgress & {
  records: ObjectRecord[];
};
