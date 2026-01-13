import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type ManualTriggerEntity } from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

const isGlobalTrigger = (manualTrigger: ManualTriggerEntity): boolean => {
  const availability = manualTrigger.availability;

  if (!isDefined(availability)) {
    return false;
  }

  return availability.type === 'GLOBAL';
};

const isObjectSpecificTrigger = (
  manualTrigger: ManualTriggerEntity,
  objectNameSingular: string,
): boolean => {
  const availability = manualTrigger.availability;

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
  const { records: manualTriggers } = useFindManyRecords<ManualTriggerEntity>({
    objectNameSingular: CoreObjectNameSingular.ManualTrigger,
    recordGqlFields: {
      id: true,
      label: true,
      icon: true,
      isPinned: true,
      availability: true,
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
