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
import { useLingui } from '@lingui/react/macro';

export const CoreWorkflowEditor = ({
  coreWorkflowId,
  coreWorkflowVersionId,
  readonly,
}: {
  coreWorkflowId: string;
  coreWorkflowVersionId: string;
  readonly: boolean;
}) => {
  const { t } = useLingui();
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

  const isVersionLoading = loading && !isDefined(coreWorkflowVersion);

  // The editable editor stays mounted while a new current version loads, so creating a draft does not blank the canvas
  if (isVersionLoading && readonly) {
    return null;
  }
  if (isDefined(error)) {
    return (
      <WorkspaceRouteUnavailable>{t`Could not load this workflow version.`}</WorkspaceRouteUnavailable>
    );
  }
  if (
    !isVersionLoading &&
    (!isDefined(coreWorkflowVersion) ||
      coreWorkflowVersion.coreWorkflowId !== coreWorkflowId)
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
