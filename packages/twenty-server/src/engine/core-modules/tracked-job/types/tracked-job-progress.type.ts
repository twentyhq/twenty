import { type z } from 'zod';

import { type TRACKED_JOB_PROGRESS_SCHEMA } from 'src/engine/core-modules/tracked-job/constants/tracked-job-progress-schema.constant';

export type TrackedJobProgress = z.infer<typeof TRACKED_JOB_PROGRESS_SCHEMA>;
