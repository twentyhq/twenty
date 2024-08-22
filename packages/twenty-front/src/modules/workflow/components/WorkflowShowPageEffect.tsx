import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { showPageWorkflowDiagramState } from '@/workflow/states/showPageWorkflowDiagramState';
import { showPageWorkflowErrorState } from '@/workflow/states/showPageWorkflowErrorState';
import { showPageWorkflowLoadingState } from '@/workflow/states/showPageWorkflowLoadingState';
import { Workflow } from '@/workflow/types/Workflow';
import { WorkflowDiagram } from '@/workflow/types/WorkflowDiagram';
import { addCreateStepNodes } from '@/workflow/utils/addCreateStepNodes';
import { generateWorklowDiagram } from '@/workflow/utils/generateWorkflowDiagram';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

type WorkflowShowPageEffectProps = {
  workflowId: string;
};

const EMPTY_FLOW_DATA: WorkflowDiagram = {
  nodes: [],
  edges: [],
};

const getFlowLastVersion = (
  workflow: Workflow | undefined,
): WorkflowDiagram => {
  if (!isDefined(workflow)) {
    return EMPTY_FLOW_DATA;
  }

  const lastVersion = workflow.versions.at(-1);
  if (!isDefined(lastVersion) || !isDefined(lastVersion.trigger)) {
    return EMPTY_FLOW_DATA;
  }

  return generateWorklowDiagram({
    trigger: lastVersion.trigger,
    steps: lastVersion.steps,
  });
};

export const WorkflowShowPageEffect = ({
  workflowId,
}: WorkflowShowPageEffectProps) => {
  const {
    record: workflow,
    loading,
    error,
  } = useFindOneRecord<Workflow>({
    objectNameSingular: CoreObjectNameSingular.Workflow,
    objectRecordId: workflowId,
    recordGqlFields: {
      id: true,
      name: true,
      versions: true,
      publishedVersionId: true,
    },
  });

  const setCurrentWorkflowData = useSetRecoilState(
    showPageWorkflowDiagramState,
  );
  const setCurrentWorkflowLoading = useSetRecoilState(
    showPageWorkflowLoadingState,
  );
  const setCurrentWorkflowError = useSetRecoilState(showPageWorkflowErrorState);

  useEffect(() => {
    const flowLastVersion = getFlowLastVersion(workflow);
    const flowWithCreateStepNodes = addCreateStepNodes(flowLastVersion);

    setCurrentWorkflowData(
      isDefined(workflow) ? flowWithCreateStepNodes : undefined,
    );
  }, [setCurrentWorkflowData, workflow]);

  useEffect(() => {
    setCurrentWorkflowLoading(loading);
  }, [loading, setCurrentWorkflowLoading]);

  useEffect(() => {
    setCurrentWorkflowError(error);
  }, [error, setCurrentWorkflowError]);

  return null;
};
