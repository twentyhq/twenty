import { buildWorkflowVersionFromCore } from '@/object-core/workflows/utils/buildWorkflowVersionFromCore';
import { useCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion';
import { isDefined } from 'twenty-shared/utils';

import { type WorkflowVersion } from '@/workflow/types/Workflow';

export const useCoreWorkflowVersionContent = ({
  coreWorkflowId,
  coreWorkflowVersionId,
}: {
  coreWorkflowId: string | undefined;
  coreWorkflowVersionId: string | undefined;
}): WorkflowVersion | undefined => {
  const { coreWorkflowVersion: loadedVersion, previousCoreWorkflowVersion } =
    useCoreWorkflowVersion(
      isDefined(coreWorkflowId) ? coreWorkflowVersionId : undefined,
    );

  // While the requested version loads, the previous one of the same workflow stays current, so the editor is never left without a version
  const coreWorkflowVersion = loadedVersion ?? previousCoreWorkflowVersion;

  if (
    !isDefined(coreWorkflowVersion) ||
    !isDefined(coreWorkflowId) ||
    !isDefined(coreWorkflowVersionId) ||
    coreWorkflowVersion.coreWorkflowId !== coreWorkflowId
  ) {
    return undefined;
  }

  return buildWorkflowVersionFromCore(coreWorkflowVersion);
};
