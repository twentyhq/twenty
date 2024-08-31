import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { RightDrawerWorkflowSelectActionContent } from '@/workflow/components/RightDrawerWorkflowSelectActionContent';
import { showPageWorkflowIdState } from '@/workflow/states/showPageWorkflowIdState';
import { Workflow } from '@/workflow/types/Workflow';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const RightDrawerWorkflowSelectAction = () => {
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

  if (!isDefined(workflow)) {
    return null;
  }

  return <RightDrawerWorkflowSelectActionContent workflow={workflow} />;
};
