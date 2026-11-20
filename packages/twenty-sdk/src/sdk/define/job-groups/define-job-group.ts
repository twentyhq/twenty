import { getJobGroupManifestErrors } from 'twenty-shared/application';

import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type JobGroupConfig } from '@/sdk/define/job-groups/job-group-config';

export const defineJobGroup: DefineEntity<JobGroupConfig> = (config) =>
  createValidationResult({
    config,
    errors: getJobGroupManifestErrors(config),
  });
