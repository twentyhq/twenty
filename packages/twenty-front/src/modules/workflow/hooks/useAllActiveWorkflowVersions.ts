import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import {
  Workflow,
  WorkflowTriggerType,
  WorkflowVersion,
} from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-ui';

export const useAllActiveWorkflowVersions = ({
  objectMetadataItem,
  triggerType,
}: {
  objectMetadataItem?: ObjectMetadataItem;
  triggerType: WorkflowTriggerType;
}) => {
  const filters = [
    {
      status: {
        eq: 'ACTIVE',
      },
    },
    {
      trigger: {
        like: `%"type": "${triggerType}"%`,
      },
    },
  ];

  if (isDefined(objectMetadataItem)) {
    filters.push({
      trigger: {
        like: `%"objectType": "${objectMetadataItem.nameSingular}"%`,
      },
    });
  }

  const { objectMetadataItem: workflowVersionObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const { records } = useFindManyRecords<
    WorkflowVersion & { workflow: Workflow }
  >({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    filter: {
      and: filters,
    },
    recordGqlFields: {
      ...generateDepthOneRecordGqlFields({
        objectMetadataItem: workflowVersionObjectMetadataItem,
      }),
      workflow: true,
    },
  });

  // TODO: refactor when we can use 'not like' in the RawJson filter
  if (!isDefined(objectMetadataItem)) {
    return {
      records: records.filter(
        (record) => !isDefined(record.trigger?.settings.objectType),
      ),
    };
  }

  return { records: records.filter((record) => isDefined(record.workflow)) };
};
