import { isDefined } from 'twenty-shared/utils';

import { type CoreWorkflowWithVersions } from '@/object-core/workflows/types/CoreWorkflowEnrichmentTypes';
import { buildWorkflowFromCoreWorkflowWithVersions } from '@/object-core/workflows/utils/buildWorkflowFromCoreWorkflowWithVersions';
import { buildWorkflowVersionFromCoreCurrentVersion } from '@/object-core/workflows/utils/buildWorkflowVersionFromCoreCurrentVersion';
import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';

export const buildWorkflowsWithCurrentVersionsFromCore = (
  coreWorkflows: CoreWorkflowWithVersions[],
): WorkflowWithCurrentVersion[] =>
  coreWorkflows.flatMap((coreWorkflow) => {
    const workflow = buildWorkflowFromCoreWorkflowWithVersions(coreWorkflow);

    if (!isDefined(workflow) || !isDefined(coreWorkflow.currentVersion)) {
      return [];
    }

    const currentVersion = buildWorkflowVersionFromCoreCurrentVersion(
      coreWorkflow.currentVersion,
    );

    return isDefined(currentVersion) ? [{ ...workflow, currentVersion }] : [];
  });
