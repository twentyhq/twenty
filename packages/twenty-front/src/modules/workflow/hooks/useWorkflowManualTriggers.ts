import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import {
  ManualTriggerAvailabilityTypeEnum,
  type ManualTriggerEntity,
} from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

const isGlobalTrigger = (manualTrigger: ManualTriggerEntity): boolean => {
  return (
    manualTrigger.availabilityType === ManualTriggerAvailabilityTypeEnum.GLOBAL
  );
};

const isObjectSpecificTrigger = (
  manualTrigger: ManualTriggerEntity,
  objectNameSingular: string,
): boolean => {
  const { availabilityType, availabilityObjectNameSingular } = manualTrigger;

  if (!isDefined(availabilityType)) {
    return false;
  }

  if (
    availabilityType === ManualTriggerAvailabilityTypeEnum.SINGLE_RECORD ||
    availabilityType === ManualTriggerAvailabilityTypeEnum.BULK_RECORDS
  ) {
    return availabilityObjectNameSingular === objectNameSingular;
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
      availabilityType: true,
      availabilityObjectNameSingular: true,
      workflowVersionId: true,
      workflowId: true,
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
