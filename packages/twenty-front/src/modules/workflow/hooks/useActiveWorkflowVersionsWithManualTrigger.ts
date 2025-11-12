import { isGlobalManualTrigger } from '@/action-menu/actions/record-actions/utils/isGlobalManualTrigger';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import {
  type ManualTriggerWorkflowVersion,
  type Workflow,
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
        like: `%"objectNameSingular": "${objectMetadataItem?.nameSingular}"%`,
      },
    });
  }

  const { records } = useFindManyRecords<
    Pick<
      ManualTriggerWorkflowVersion,
      'id' | '__typename' | 'status' | 'workflowId' | 'trigger'
    > & {
      workflow: Workflow;
    }
  >({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    filter: {
      and: filters,
    },
    recordGqlFields: {
      id: true,
      trigger: true,
      workflowId: true,
      workflow: true,
      status: true,
    },
    skip,
  });

  // TODO: refactor when we can use 'not like' in the RawJson filter
  if (!isDefined(objectMetadataItem)) {
    return {
      records: records.filter(
        (record) =>
          record.status === 'ACTIVE' &&
          isDefined(record.trigger) &&
          isGlobalManualTrigger(record.trigger),
      ),
    };
  }

  return { records: records.filter((record) => isDefined(record.workflow)) };
};
