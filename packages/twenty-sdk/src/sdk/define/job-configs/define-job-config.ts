import { getJobConfigManifestErrors } from 'twenty-shared/application';

import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type JobConfigConfig } from '@/sdk/define/job-configs/job-config-config';

export const defineJobConfig: DefineEntity<JobConfigConfig> = (config) =>
  createValidationResult({
    config,
    errors: getJobConfigManifestErrors(config),
  });
