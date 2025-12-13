import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  type WorkflowAction,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { generateFindRecordsOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateFindRecordsOutputSchema';
import { generateFormOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateFormOutputSchema';
import { generateRecordEventOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateRecordEventOutputSchema';
import { generateRecordOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateRecordOutputSchema';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DatabaseEventAction } from '~/generated/graphql';

const PERSISTED_OUTPUT_SCHEMA_TYPES = [
  'CODE',
  'HTTP_REQUEST',
  'AI_AGENT',
  'WEBHOOK',
  'ITERATOR',
];

const findObjectMetadataItemByName = (
  objectMetadataItems: ObjectMetadataItem[],
  objectName: string,
): ObjectMetadataItem | undefined => {
  return objectMetadataItems.find((item) => item.nameSingular === objectName);
};

const parseEventName = (
  eventName: string,
): { objectName: string; action: DatabaseEventAction } | undefined => {
  const [objectName, actionString] = eventName.split('.');

  if (!objectName || !actionString) {
    return undefined;
  }

  const actionMap: Record<string, DatabaseEventAction> = {
    created: DatabaseEventAction.CREATED,
    updated: DatabaseEventAction.UPDATED,
    deleted: DatabaseEventAction.DELETED,
    upserted: DatabaseEventAction.UPSERTED,
  };

  const action = actionMap[actionString.toLowerCase()];

  if (!action) {
    return undefined;
  }

  return { objectName, action };
};

export const computeStepOutputSchema = ({
  step,
  objectMetadataItems,
}: {
  step: WorkflowTrigger | WorkflowAction;
  objectMetadataItems: ObjectMetadataItem[];
}): OutputSchemaV2 | undefined => {
  const stepType = step.type;

  if (PERSISTED_OUTPUT_SCHEMA_TYPES.includes(stepType)) {
    return undefined;
  }

  switch (stepType) {
    case 'DATABASE_EVENT': {
      const eventName = step.settings?.eventName;

      if (!isDefined(eventName)) {
        return {};
      }

      const parsed = parseEventName(eventName);

      if (!parsed) {
        return {};
      }

      const objectMetadataItem = findObjectMetadataItemByName(
        objectMetadataItems,
        parsed.objectName,
      );

      if (!objectMetadataItem) {
        return {};
      }

      return generateRecordEventOutputSchema(objectMetadataItem, parsed.action);
    }

    case 'MANUAL': {
      const availability = step.settings?.availability;

      if (!isDefined(availability)) {
        return {};
      }

      if (availability.type === 'GLOBAL') {
        return {};
      }

      if (
        availability.type === 'SINGLE_RECORD' ||
        availability.type === 'BULK_RECORDS'
      ) {
        const objectMetadataItem = findObjectMetadataItemByName(
          objectMetadataItems,
          availability.objectNameSingular,
        );

        if (!objectMetadataItem) {
          return {};
        }

        if (availability.type === 'SINGLE_RECORD') {
          return generateRecordOutputSchema(objectMetadataItem);
        }

        // BULK_RECORDS - return array indicator
        return {
          [objectMetadataItem.namePlural]: {
            isLeaf: true,
            label: objectMetadataItem.labelPlural,
            type: 'array',
            value: `Array of ${objectMetadataItem.labelPlural}`,
          },
        };
      }

      return {};
    }

    case 'CRON': {
      return {};
    }

    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
    case 'DELETE_RECORD':
    case 'UPSERT_RECORD': {
      const objectName = step.settings?.input?.objectName;

      if (!isDefined(objectName)) {
        return {};
      }

      const objectMetadataItem = findObjectMetadataItemByName(
        objectMetadataItems,
        objectName,
      );

      if (!objectMetadataItem) {
        return {};
      }

      return generateRecordOutputSchema(objectMetadataItem);
    }

    case 'FIND_RECORDS': {
      const objectName = step.settings?.input?.objectName;

      if (!isDefined(objectName)) {
        return {};
      }

      const objectMetadataItem = findObjectMetadataItemByName(
        objectMetadataItems,
        objectName,
      );

      if (!objectMetadataItem) {
        return {};
      }

      return generateFindRecordsOutputSchema(objectMetadataItem);
    }

    case 'FORM': {
      const formFields = step.settings?.input as
        | WorkflowFormActionField[]
        | undefined;

      if (!isDefined(formFields) || formFields.length === 0) {
        return {};
      }

      return generateFormOutputSchema(formFields, objectMetadataItems);
    }

    case 'SEND_EMAIL': {
      return {
        success: {
          isLeaf: true,
          type: FieldMetadataType.BOOLEAN,
          label: 'Success',
          value: true,
        },
      };
    }

    case 'FILTER':
    case 'DELAY':
    case 'EMPTY': {
      return {};
    }

    default: {
      return {};
    }
  }
};

export const shouldComputeOutputSchemaOnFrontend = (
  stepType: string,
): boolean => {
  return !PERSISTED_OUTPUT_SCHEMA_TYPES.includes(stepType);
};
