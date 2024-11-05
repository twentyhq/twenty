import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Workflow, WorkflowVersion } from '@/workflow/types/Workflow';

export const useActiveWorkflowVersionsWithTriggerRecordType = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { records } = useFindManyRecords<
    WorkflowVersion & { workflow: Workflow }
  >({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    filter: {
      and: [
        {
          status: {
            eq: 'ACTIVE',
          },
        },
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
      ...generateDepthOneRecordGqlFields({ objectMetadataItem }),
      workflow: true,
    },
  });

  return { records };
};
