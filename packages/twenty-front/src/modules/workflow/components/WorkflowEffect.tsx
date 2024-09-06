import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowDiagramState } from '@/workflow/states/workflowDiagramState';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { WorkflowVersion } from '@/workflow/types/Workflow';
import { addCreateStepNodes } from '@/workflow/utils/addCreateStepNodes';
import { getWorkflowVersionDiagram } from '@/workflow/utils/getWorkflowVersionDiagram';
import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

type WorkflowEffectProps = {
  workflowId: string;
};

export const WorkflowEffect = ({ workflowId }: WorkflowEffectProps) => {
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  const setWorkflowId = useSetRecoilState(workflowIdState);
  const setWorkflowDiagram = useSetRecoilState(workflowDiagramState);

  const [isCreatingInitialVersionState, setIsCreatingInitialVersionState] =
    useState<boolean>(false);

  const { createOneRecord: createOneWorkflowVersion } =
    useCreateOneRecord<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  useEffect(() => {
    setWorkflowId(workflowId);
  }, [setWorkflowId, workflowId]);

  useEffect(() => {
    setIsCreatingInitialVersionState(false);
  }, [workflowId]);

  useEffect(() => {
    if (!isDefined(workflowWithCurrentVersion)) {
      setWorkflowDiagram(undefined);

      return;
    }

    const currentVersion = workflowWithCurrentVersion.currentVersion;
    if (!isDefined(currentVersion)) {
      setWorkflowDiagram(undefined);

      if (isCreatingInitialVersionState) {
        return;
      }

      setIsCreatingInitialVersionState(true);

      createOneWorkflowVersion({
        workflowId,
        status: 'DRAFT',
        name: 'v1',
      }).finally(() => {
        setIsCreatingInitialVersionState(false);
      });

      return;
    }

    const lastWorkflowDiagram = getWorkflowVersionDiagram(currentVersion);
    const workflowDiagramWithCreateStepNodes =
      addCreateStepNodes(lastWorkflowDiagram);

    setWorkflowDiagram(workflowDiagramWithCreateStepNodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isCreatingInitialVersionState,
    setWorkflowDiagram,
    workflowId,
    workflowWithCurrentVersion,
  ]);

  return null;
};
