import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { showPageWorkflowDiagramState } from '@/workflow/states/showPageWorkflowDiagramState';
import { showPageWorkflowErrorState } from '@/workflow/states/showPageWorkflowErrorState';
import { showPageWorkflowLoadingState } from '@/workflow/states/showPageWorkflowLoadingState';
import { Workflow } from '@/workflow/types/Workflow';
import { addCreateStepNodes } from '@/workflow/utils/addCreateStepNodes';
import { getWorkflowLastDiagramVersion } from '@/workflow/utils/getWorkflowLastDiagramVersion';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

type WorkflowShowPageEffectProps = {
  workflowId: string;
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
    const flowLastVersion = getWorkflowLastDiagramVersion(workflow);
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
