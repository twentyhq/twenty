import { isGlobalManualTrigger } from '@/action-menu/actions/record-actions/utils/isGlobalManualTrigger';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type WorkflowManualTriggerEntity } from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

const isGlobalTrigger = (
  manualTrigger: WorkflowManualTriggerEntity,
): boolean => {
  const trigger = {
    type: 'MANUAL' as const,
    settings: manualTrigger.settings,
  };
  return isGlobalManualTrigger(trigger);
};

const isObjectSpecificTrigger = (
  manualTrigger: WorkflowManualTriggerEntity,
  objectNameSingular: string,
): boolean => {
  const availability = manualTrigger.settings?.availability;

  if (!isDefined(availability)) {
    return false;
  }

  if (
    availability.type === 'SINGLE_RECORD' ||
    availability.type === 'BULK_RECORDS'
  ) {
    return (
      'objectNameSingular' in availability &&
      availability.objectNameSingular === objectNameSingular
    );
  }

  return false;
};

export const useWorkflowManualTriggers = ({
  objectMetadataItem,
  skip,
}: {
  objectMetadataItem?: ObjectMetadataItem;
  skip?: boolean;
}) => {
  const { records: manualTriggers } =
    useFindManyRecords<WorkflowManualTriggerEntity>({
      objectNameSingular: CoreObjectNameSingular.WorkflowManualTrigger,
      recordGqlFields: {
        id: true,
        settings: true,
        workflowVersionId: true,
        workflowId: true,
        workflowName: true,
      },
      skip,
    });

  const records = isDefined(objectMetadataItem)
    ? manualTriggers.filter((manualTrigger) =>
        isObjectSpecificTrigger(manualTrigger, objectMetadataItem.nameSingular),
      )
    : manualTriggers.filter(isGlobalTrigger);

  return { records };
};
