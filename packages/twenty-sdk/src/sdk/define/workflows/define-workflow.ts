import {
  type WorkflowManifest,
  workflowManifestSchema,
} from 'twenty-shared/application';

import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';

export const defineWorkflow: DefineEntity<WorkflowManifest> = (config) => {
  const result = workflowManifestSchema.safeParse(config);

  return createValidationResult({
    config,
    errors: result.success
      ? []
      : result.error.issues.map(
          (issue) => `${issue.path.join('.')}: ${issue.message}`,
        ),
  });
};
