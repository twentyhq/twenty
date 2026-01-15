import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import {
  ManualTriggerAvailabilityTypeEnum,
  type ManualTriggerEntity,
  type ManualTriggerWorkflowVersion,
  type WorkflowManualTriggerSchema,
} from '@/workflow/types/Workflow';
import { MANUAL_TRIGGER } from '@/workflow/workflow-trigger/constants/triggers/ManualTrigger';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
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

const transformWorkflowVersionToManualTrigger = (
  workflowVersion: ManualTriggerWorkflowVersion,
): ManualTriggerEntity | null => {
  const trigger = workflowVersion.trigger as WorkflowManualTriggerSchema | null;

  if (!isDefined(trigger) || trigger.type !== MANUAL_TRIGGER.type) {
    return null;
  }

  const availability = trigger.settings?.availability;
  let availabilityType: ManualTriggerAvailabilityTypeEnum | null = null;
  let availabilityObjectNameSingular: string | null = null;

  if (isDefined(availability)) {
    availabilityType = availability.type as ManualTriggerAvailabilityTypeEnum;
    if (
      availability.type === ManualTriggerAvailabilityTypeEnum.SINGLE_RECORD ||
      availability.type === ManualTriggerAvailabilityTypeEnum.BULK_RECORDS
    ) {
      availabilityObjectNameSingular = availability.objectNameSingular;
    }
  }

  return {
    id: workflowVersion.id,
    label: trigger.name ?? '',
    icon: trigger.settings?.icon ?? null,
    isPinned: trigger.settings?.isPinned ?? null,
    availabilityType,
    availabilityObjectNameSingular,
    workflowVersionId: workflowVersion.id,
    workflowId: workflowVersion.workflowId,
    __typename: 'ManualTrigger',
  };
};

export const useWorkflowManualTriggers = ({
  objectMetadataItem,
  skip,
}: {
  objectMetadataItem?: ObjectMetadataItem;
  skip?: boolean;
}) => {
  const manualTriggerMetadata = useRecoilValue(
    objectMetadataItemFamilySelector({
      objectName: CoreObjectNameSingular.ManualTrigger,
      objectNameType: 'singular',
    }),
  );
  const manualTriggerObjectExists = isDefined(manualTriggerMetadata);

  const { records: manualTriggers, loading: loadingNew } =
    useFindManyRecords<ManualTriggerEntity>({
      objectNameSingular: manualTriggerObjectExists
        ? CoreObjectNameSingular.ManualTrigger
        : CoreObjectNameSingular.WorkflowVersion,
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
      skip: skip || !manualTriggerObjectExists,
    });

  const { records: workflowVersions, loading: loadingFallback } =
    useFindManyRecords<ManualTriggerWorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
      filter: {
        status: { eq: 'ACTIVE' },
      },
      recordGqlFields: {
        id: true,
        workflowId: true,
        trigger: true,
      },
      skip: skip || manualTriggerObjectExists,
    });

  const fallbackTriggers = useMemo(() => {
    if (manualTriggerObjectExists) {
      return [];
    }

    return workflowVersions
      .filter(
        (version) =>
          isDefined(version.trigger) &&
          version.trigger.type === MANUAL_TRIGGER.type,
      )
      .map(transformWorkflowVersionToManualTrigger)
      .filter(isDefined);
  }, [manualTriggerObjectExists, workflowVersions]);

  const allTriggers = manualTriggerObjectExists
    ? manualTriggers
    : fallbackTriggers;

  const records = isDefined(objectMetadataItem)
    ? allTriggers.filter((manualTrigger) =>
        isObjectSpecificTrigger(manualTrigger, objectMetadataItem.nameSingular),
      )
    : allTriggers.filter(isGlobalTrigger);

  return {
    records,
    loading: loadingNew || loadingFallback,
  };
};
