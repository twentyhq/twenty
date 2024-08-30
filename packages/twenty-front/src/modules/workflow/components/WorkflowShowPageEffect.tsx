import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { showPageWorkflowDiagramState } from '@/workflow/states/showPageWorkflowDiagramState';
import { showPageWorkflowErrorState } from '@/workflow/states/showPageWorkflowErrorState';
import { showPageWorkflowIdState } from '@/workflow/states/showPageWorkflowIdState';
import { showPageWorkflowLoadingState } from '@/workflow/states/showPageWorkflowLoadingState';
import { Workflow, WorkflowVersion } from '@/workflow/types/Workflow';
import { addCreateStepNodes } from '@/workflow/utils/addCreateStepNodes';
import { getWorkflowVersionDiagram } from '@/workflow/utils/getWorkflowVersionDiagram';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

type WorkflowShowPageEffectProps = {
  workflowId: string;
};

const useFindCurrentWorkflowVersion = (workflowId: string) => {
  const { record: workflow } = useFindOneRecord<Workflow>({
    objectNameSingular: CoreObjectNameSingular.Workflow,
    objectRecordId: workflowId,
    recordGqlFields: {
      id: true,
      name: true,
      lastPublishedVersionId: true,
      statuses: true,
      versions: true,
    },
  });

  const { record: lastPublishedVersion } = useFindOneRecord<WorkflowVersion>({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    objectRecordId: workflow?.lastPublishedVersionId,
    skip: !(
      typeof workflow?.lastPublishedVersionId === 'string' &&
      workflow.lastPublishedVersionId !== ''
    ),
    recordGqlFields: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      workflowId: true,
      trigger: true,
      steps: true,
    },
  });

  const { records: workflowDraftVersions } =
    useFindManyRecords<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
      filter: {
        status: {
          eq: 'DRAFT',
        },
      },
      limit: 1,
    });

  const draftVersion = workflowDraftVersions?.[0];
  if (isDefined(draftVersion)) {
    return draftVersion;
  }

  return lastPublishedVersion;
};

export const WorkflowShowPageEffect = ({
  workflowId,
}: WorkflowShowPageEffectProps) => {
  const lastVersion = useFindCurrentWorkflowVersion(workflowId);

  const setShowPageWorkflowId = useSetRecoilState(showPageWorkflowIdState);
  const setCurrentWorkflowData = useSetRecoilState(
    showPageWorkflowDiagramState,
  );
  const setCurrentWorkflowLoading = useSetRecoilState(
    showPageWorkflowLoadingState,
  );
  const setCurrentWorkflowError = useSetRecoilState(showPageWorkflowErrorState);

  useEffect(() => {
    setShowPageWorkflowId(workflowId);
  }, [setShowPageWorkflowId, workflowId]);

  useEffect(() => {
    const flowLastVersion = getWorkflowVersionDiagram(lastVersion);
    const flowWithCreateStepNodes = addCreateStepNodes(flowLastVersion);

    setCurrentWorkflowData(
      isDefined(lastVersion) ? flowWithCreateStepNodes : undefined,
    );
  }, [setCurrentWorkflowData, lastVersion]);

  // useEffect(() => {
  //   setCurrentWorkflowLoading(loading);
  // }, [loading, setCurrentWorkflowLoading]);

  // useEffect(() => {
  //   setCurrentWorkflowError(error);
  // }, [error, setCurrentWorkflowError]);

  return null;
};
