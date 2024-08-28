import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { showPageWorkflowIdState } from '@/workflow/states/showPageWorkflowIdState';
import { Workflow } from '@/workflow/types/Workflow';
import { useRecoilValue } from 'recoil';

export const useFindShowPageWorkflow = () => {
  const showPageWorkflowId = useRecoilValue(showPageWorkflowIdState);

  const { record: workflow } = useFindOneRecord<Workflow>({
    objectNameSingular: CoreObjectNameSingular.Workflow,
    objectRecordId: showPageWorkflowId,
    recordGqlFields: {
      id: true,
      name: true,
      versions: true,
      publishedVersionId: true,
    },
  });

  return workflow;
};
