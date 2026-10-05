import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import {
  type WorkflowAction,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { generateClassifyOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateClassifyOutputSchema';
import { generateFindRecordsOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateFindRecordsOutputSchema';
import { generateFormOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateFormOutputSchema';
import { generateRecordEventOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateRecordEventOutputSchema';
import { generateRecordOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateRecordOutputSchema';
import { generateWaitForEventOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateWaitForEventOutputSchema';
import { t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  buildManualTriggerMetadataNode,
  type Node,
  WORKFLOW_TRIGGER_METADATA_KEY,
  WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_KEY,
  WORKFLOW_TRIGGER_PAYLOAD_KEY,
} from 'twenty-shared/workflow';
import { DatabaseEventAction } from '~/generated-metadata/graphql';

const PERSISTED_OUTPUT_SCHEMA_TYPES = [
  'AI_AGENT',
  'CODE',
  'HTTP_REQUEST',
  'LOGIC_FUNCTION',
  'WEBHOOK',
  'ITERATOR',
];

const findObjectMetadataItemByName = (
  objectMetadataItems: EnrichedObjectMetadataItem[],
  objectName: string,
): EnrichedObjectMetadataItem | undefined => {
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

// The shared builder keeps the English labels the server stores, so the front translates them when it builds its own copy
const buildTranslatedMetadataNode = (): Node => {
  const metadataNode = buildManualTriggerMetadataNode();

  return {
    ...metadataNode,
    label: t`Metadata`,
    value: {
      ...metadataNode.value,
      [WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_KEY]: {
        ...metadataNode.value[
          WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_KEY
        ],
        label: t`Workspace Member ID`,
      },
    },
  };
};

export const computeStepOutputSchema = ({
  step,
  objectMetadataItems,
}: {
  step: WorkflowTrigger | WorkflowAction;
  objectMetadataItems: EnrichedObjectMetadataItem[];
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
        return {
          [WORKFLOW_TRIGGER_METADATA_KEY]: buildTranslatedMetadataNode(),
        };
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
          return {
            [WORKFLOW_TRIGGER_PAYLOAD_KEY]: {
              isLeaf: false,
              icon: objectMetadataItem.icon ?? undefined,
              label: t`Record`,
              value: generateRecordOutputSchema(objectMetadataItem),
            },
            [WORKFLOW_TRIGGER_METADATA_KEY]: buildTranslatedMetadataNode(),
          };
        }

        const objectLabelPlural = objectMetadataItem.labelPlural;

        return {
          [WORKFLOW_TRIGGER_PAYLOAD_KEY]: {
            isLeaf: false,
            type: 'object',
            label: t`Records`,
            value: {
              [objectMetadataItem.namePlural]: {
                isLeaf: true,
                label: objectLabelPlural,
                type: 'array',
                value: t`Array of ${objectLabelPlural}`,
              },
            },
          },
          [WORKFLOW_TRIGGER_METADATA_KEY]: buildTranslatedMetadataNode(),
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
    case 'UPSERT_RECORD':
    case 'PICK_RECORD': {
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

    case 'SEND_CHAT_MESSAGE': {
      const threadIdOutputSchema: OutputSchemaV2 = {
        threadId: {
          isLeaf: true,
          type: FieldMetadataType.UUID,
          label: t`Conversation ID`,
          value: '',
        },
      };

      if (!isDefined(step.settings?.input?.toolCall)) {
        return threadIdOutputSchema;
      }

      return {
        ...threadIdOutputSchema,
        outcome: {
          isLeaf: true,
          type: FieldMetadataType.TEXT,
          label: t`Outcome`,
          value: 'executed',
        },
        toolName: {
          isLeaf: true,
          type: FieldMetadataType.TEXT,
          label: t`Action`,
          value: '',
        },
        feedback: {
          isLeaf: true,
          type: FieldMetadataType.TEXT,
          label: t`Feedback`,
          value: '',
        },
        error: {
          isLeaf: true,
          type: FieldMetadataType.TEXT,
          label: t`Error`,
          value: '',
        },
        arguments: {
          isLeaf: true,
          type: FieldMetadataType.RAW_JSON,
          label: t`Arguments`,
          value: null,
        },
        output: {
          isLeaf: true,
          type: FieldMetadataType.RAW_JSON,
          label: t`Output`,
          value: null,
        },
      };
    }

    case 'SEND_EMAIL': {
      return {
        success: {
          isLeaf: true,
          type: FieldMetadataType.BOOLEAN,
          label: t`Success`,
          value: true,
        },
        headerMessageId: {
          isLeaf: true,
          type: FieldMetadataType.TEXT,
          label: t`Message-ID header`,
          value: '',
        },
        messageId: {
          isLeaf: true,
          type: FieldMetadataType.TEXT,
          label: t`Message record ID`,
          value: '',
        },
        messageThreadId: {
          isLeaf: true,
          type: FieldMetadataType.TEXT,
          label: t`Message thread ID`,
          value: '',
        },
      };
    }

    case 'DRAFT_EMAIL': {
      return {
        success: {
          isLeaf: true,
          type: FieldMetadataType.BOOLEAN,
          label: t`Success`,
          value: true,
        },
      };
    }

    case 'CREATE_CALENDAR_EVENT': {
      return {
        success: {
          isLeaf: true,
          type: FieldMetadataType.BOOLEAN,
          label: t`Success`,
          value: true,
        },
        iCalUid: {
          isLeaf: true,
          type: FieldMetadataType.TEXT,
          label: t`iCal UID`,
          value: '',
        },
        externalEventId: {
          isLeaf: true,
          type: FieldMetadataType.TEXT,
          label: t`External Event ID`,
          value: '',
        },
        conferenceLink: {
          isLeaf: true,
          type: FieldMetadataType.TEXT,
          label: t`Conference Link`,
          value: '',
        },
      };
    }

    case 'CLASSIFY': {
      return generateClassifyOutputSchema(step.settings.input.questions);
    }

    case 'WAIT_FOR_EVENT': {
      const parsedEventName = parseEventName(
        step.settings?.input?.eventName ?? '',
      );

      if (!isDefined(parsedEventName)) {
        return {};
      }

      const objectMetadataItem = findObjectMetadataItemByName(
        objectMetadataItems,
        parsedEventName.objectName,
      );

      if (!isDefined(objectMetadataItem)) {
        return {};
      }

      return generateWaitForEventOutputSchema(
        objectMetadataItem,
        parsedEventName.action,
      );
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
