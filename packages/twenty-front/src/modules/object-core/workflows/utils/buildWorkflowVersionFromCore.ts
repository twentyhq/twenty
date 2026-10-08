import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { type GetCoreWorkflowVersionQuery } from '~/generated/graphql';
import { isDefined } from 'twenty-shared/utils';

export const buildWorkflowVersionFromCore = (
  version: GetCoreWorkflowVersionQuery['coreWorkflowVersion'],
): WorkflowVersion | undefined =>
  isDefined(version) && isDefined(version.coreWorkflowId)
    ? {
        __typename: 'WorkflowVersion',
        id: version.id,
        workflowId: version.coreWorkflowId,
        name: version.label,
        status: version.status,
        trigger: version.trigger,
        steps: version.steps,
        createdAt: version.createdAt,
        updatedAt: version.updatedAt,
      }
    : undefined;
