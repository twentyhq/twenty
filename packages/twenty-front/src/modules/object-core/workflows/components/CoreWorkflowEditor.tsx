import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceRouteUnavailable } from '@/ui/layout/page/components/WorkspaceRouteUnavailable';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { shouldWorkflowRefetchRequestFamilyState } from '@/workflow/states/shouldWorkflowRefetchRequestFamilyState';
import { useListenToCoreWorkflowEvents } from '@/object-core/workflows/hooks/useListenToCoreWorkflowEvents';
import { useCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion';
import { CoreWorkflowVersionCard } from '@/object-core/workflows/versions/components/CoreWorkflowVersionCard';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowDiagramCanvasEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditable';
import { WorkflowDiagramEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramEffect';
import { WorkflowVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowVisualizerEffect';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const CoreWorkflowEditor = ({
  coreWorkflowId,
  coreWorkflowVersionId,
  readonly,
}: {
  coreWorkflowId: string;
  coreWorkflowVersionId: string;
  readonly: boolean;
}) => {
  const { coreWorkflowVersion, loading, error, refetchCoreWorkflowVersion } =
    useCoreWorkflowVersion(coreWorkflowVersionId);

  const setShouldWorkflowRefetchRequest = useSetAtomFamilyState(
    shouldWorkflowRefetchRequestFamilyState,
    coreWorkflowId,
  );

  const refetchCoreWorkflow = useCallback(() => {
    void refetchCoreWorkflowVersion();
    setShouldWorkflowRefetchRequest(true);
  }, [refetchCoreWorkflowVersion, setShouldWorkflowRefetchRequest]);

  useListenToCoreWorkflowEvents({
    coreWorkflowId,
    refetch: refetchCoreWorkflow,
  });

  if (loading && !isDefined(coreWorkflowVersion)) {
    return null;
  }
  if (isDefined(error)) {
    return (
      <WorkspaceRouteUnavailable>{t`Could not load this workflow version.`}</WorkspaceRouteUnavailable>
    );
  }
  if (
    !isDefined(coreWorkflowVersion) ||
    coreWorkflowVersion.coreWorkflowId !== coreWorkflowId
  ) {
    return (
      <WorkspaceRouteUnavailable>{t`Workflow version not found.`}</WorkspaceRouteUnavailable>
    );
  }

  if (readonly) {
    return (
      <CoreWorkflowVersionCard coreWorkflowVersionId={coreWorkflowVersionId} />
    );
  }

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: coreWorkflowId,
        }),
      }}
    >
      <WorkflowVisualizerEffect workflowId={coreWorkflowId} />
      <WorkflowDiagramEffect />
      <WorkflowDiagramCanvasEditable />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
