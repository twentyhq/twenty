import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import {
  ManualTriggerWorkflowVersion,
  Workflow,
} from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

export const useActiveWorkflowVersionsWithManualTrigger = ({
  objectMetadataItem,
  skip,
}: {
  objectMetadataItem?: ObjectMetadataItem;
  skip?: boolean;
}) => {
  const filters = [
    {
      status: {
        eq: 'ACTIVE',
      },
    },
    {
      trigger: {
        like: `%"type": "MANUAL"%`,
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
    ManualTriggerWorkflowVersion & { workflow: Workflow }
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
    skip,
  });

  // TODO: refactor when we can use 'not like' in the RawJson filter
  if (!isDefined(objectMetadataItem)) {
    return {
      records: records.filter(
        (record) =>
          record.status === 'ACTIVE' &&
          record.trigger?.type === 'MANUAL' &&
          !isDefined(record.trigger?.settings.objectType),
      ),
    };
  }

  return { records: records.filter((record) => isDefined(record.workflow)) };
};
