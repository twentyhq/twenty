import { WORKFLOW_JOB_GROUP_KEY } from 'src/engine/core-modules/job-group/constants/workflow-job-group-key.constant';
import { type JobGroupConfigByKey } from 'src/engine/core-modules/job-group/types/job-group-config-by-key.type';

// A workspace overrides a default with a jobGroup row of the same key.
export const DEFAULT_JOB_GROUP_CONFIG_BY_KEY: JobGroupConfigByKey = {
  [WORKFLOW_JOB_GROUP_KEY]: {
    limiter: { max: 100, durationMs: 60_000 },
  },
};
