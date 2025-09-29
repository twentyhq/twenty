import { isGlobalManualTrigger } from '@/action-menu/actions/record-actions/utils/isGlobalManualTrigger';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import {
  type ManualTriggerWorkflowVersion,
  type Workflow,
} from '@/workflow/types/Workflow';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated/graphql';

export const useActiveWorkflowVersionsWithManualTrigger = ({
  objectMetadataItem,
  skip,
}: {
  objectMetadataItem?: ObjectMetadataItem;
  skip?: boolean;
}) => {
  const isIteratorEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_ITERATOR_ENABLED,
  );

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

  const objectTypeFilter = isIteratorEnabled
    ? {
        trigger: {
          like: `%"objectNameSingular": "${objectMetadataItem?.nameSingular}"%`,
        },
      }
    : {
        trigger: {
          like: `%"objectType": "${objectMetadataItem?.nameSingular}"%`,
        },
      };

  if (isDefined(objectMetadataItem)) {
    filters.push(objectTypeFilter);
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
          isDefined(record.trigger) &&
          isGlobalManualTrigger(record.trigger, isIteratorEnabled),
      ),
    };
  }

  return { records: records.filter((record) => isDefined(record.workflow)) };
};
