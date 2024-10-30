import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Workflow, WorkflowVersion } from '@/workflow/types/Workflow';

export const useActiveWorkflowVersionsWithTriggerRecordType = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { records } = useFindManyRecords<
    WorkflowVersion & { workflow: Workflow }
  >({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    filter: {
      and: [
        {
          trigger: {
            like: '%"type": "MANUAL"%',
          },
        },
        {
          trigger: {
            like: `%"objectType": "${objectNameSingular}"%`,
          },
        },
      ],
    },
    recordGqlFields: {
      workflow: true,
    },
  });

  return { records };
};
