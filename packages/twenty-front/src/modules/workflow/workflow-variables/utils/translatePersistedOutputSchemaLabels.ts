import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS } from '@/workflow/workflow-variables/constants/WorkflowPersistedOutputSchemaLabels';
import {
  type FieldOutputSchemaV2,
  type RecordOutputSchemaV2,
} from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isRecordOutputSchemaV2';
import { type MessageDescriptor } from '@lingui/core';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  type BaseOutputSchemaV2,
  isBaseOutputSchemaV2,
} from 'twenty-shared/workflow';

type TranslationContext = {
  stepType: string;
  labelEntries: [string, MessageDescriptor][];
  objectMetadataItems: EnrichedObjectMetadataItem[];
  stepObjectMetadataItem?: EnrichedObjectMetadataItem;
};

const findObjectMetadataItem = ({
  objectMetadataItems,
  objectMetadataId,
}: {
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectMetadataId: string;
}) => objectMetadataItems.find(({ id }) => id === objectMetadataId);

const findObjectMetadataId = (value: unknown): string | undefined => {
  if (isRecordOutputSchemaV2(value)) {
    return value.object.objectMetadataId;
  }

  if (!isBaseOutputSchemaV2(value)) {
    return undefined;
  }

  return Object.values(value)
    .map((node) => findObjectMetadataId(node.value))
    .find(isDefined);
};

const matchesPath = ({
  labelPath,
  path,
}: {
  labelPath: string;
  path: string[];
}) => {
  const labelPathSegments = labelPath.split('.');

  return (
    labelPathSegments.length === path.length &&
    labelPathSegments.every(
      (segment, index) => segment === '*' || segment === path[index],
    )
  );
};

// labels naming the step's object, so the viewer sees that object's label in their language
const translateObjectLabel = ({
  stepType,
  key,
  value,
  objectMetadataItem,
}: {
  stepType: string;
  key: string;
  value: unknown;
  objectMetadataItem?: EnrichedObjectMetadataItem;
}): string | undefined => {
  if (stepType === 'MANUAL' && key === 'payload') {
    return isRecordOutputSchemaV2(value) ? t`Record` : t`Records`;
  }

  if (stepType === 'ITERATOR' && key === 'currentItem') {
    if (!isDefined(objectMetadataItem)) {
      return t`Current Item`;
    }

    const objectLabel = objectMetadataItem.labelSingular;

    return t`Current Item (${objectLabel})`;
  }

  if (!isDefined(objectMetadataItem)) {
    return undefined;
  }

  const { labelSingular, labelPlural } = objectMetadataItem;

  if (stepType === 'FIND_RECORDS' && key === 'first') {
    return t`First ${labelSingular}`;
  }

  if (stepType === 'FIND_RECORDS' && key === 'all') {
    return t`All ${labelPlural}`;
  }

  if (stepType === 'WAIT_FOR_EVENT' && key === 'record') {
    return labelSingular;
  }

  if (stepType === 'WAIT_FOR_EVENT' && key === 'before') {
    return t`${labelSingular} Before Update`;
  }

  return undefined;
};

const translateLabel = ({
  path,
  node,
  context,
}: {
  path: string[];
  node: BaseOutputSchemaV2[string];
  context: TranslationContext;
}): string => {
  const message = context.labelEntries.find(([labelPath]) =>
    matchesPath({ labelPath, path }),
  )?.[1];

  if (isDefined(message)) {
    return t(message);
  }

  if (path.length !== 1) {
    return node.label;
  }

  return (
    translateObjectLabel({
      stepType: context.stepType,
      key: path[0],
      value: node.value,
      objectMetadataItem: context.stepObjectMetadataItem,
    }) ?? node.label
  );
};

const translateRecordField = ({
  key,
  field,
  objectMetadataItem,
  context,
}: {
  key: string;
  field: FieldOutputSchemaV2;
  objectMetadataItem?: EnrichedObjectMetadataItem;
  context: TranslationContext;
}): FieldOutputSchemaV2 => {
  const fieldMetadataItem = objectMetadataItem?.fields.find(
    ({ id }) => id === field.fieldMetadataId,
  );

  // a relation id field is shown under its own label, not the relation's
  const label =
    isDefined(fieldMetadataItem) &&
    key.split('.').pop() === fieldMetadataItem.name
      ? fieldMetadataItem.label
      : field.label;

  if (field.isLeaf) {
    return { ...field, label };
  }

  if (isRecordOutputSchemaV2(field.value)) {
    return {
      ...field,
      label,
      value: translateRecordOutputSchema({
        recordOutputSchema: field.value,
        context,
      }),
    };
  }

  return { ...field, label };
};

const translateRecordOutputSchema = ({
  recordOutputSchema,
  context,
}: {
  recordOutputSchema: RecordOutputSchemaV2;
  context: TranslationContext;
}): RecordOutputSchemaV2 => {
  const objectMetadataItem = findObjectMetadataItem({
    objectMetadataItems: context.objectMetadataItems,
    objectMetadataId: recordOutputSchema.object.objectMetadataId,
  });

  return {
    ...recordOutputSchema,
    object: {
      ...recordOutputSchema.object,
      label:
        objectMetadataItem?.labelSingular ?? recordOutputSchema.object.label,
    },
    fields: Object.fromEntries(
      Object.entries(recordOutputSchema.fields).map(([key, field]) => [
        key,
        translateRecordField({ key, field, objectMetadataItem, context }),
      ]),
    ),
  };
};

const translateOutputSchema = ({
  outputSchema,
  path,
  context,
}: {
  outputSchema: Record<string, unknown>;
  path: string[];
  context: TranslationContext;
}): OutputSchemaV2 => {
  if (isRecordOutputSchemaV2(outputSchema)) {
    return translateRecordOutputSchema({
      recordOutputSchema: outputSchema,
      context,
    });
  }

  if (!isBaseOutputSchemaV2(outputSchema)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(outputSchema).map(([key, node]) => {
      const nodePath = [...path, key];
      const label = translateLabel({ path: nodePath, node, context });

      if (node.isLeaf) {
        return [key, { ...node, label }];
      }

      return [
        key,
        {
          ...node,
          label,
          value: translateOutputSchema({
            outputSchema: node.value,
            path: nodePath,
            context,
          }),
        },
      ];
    }),
  );
};

// the server writes labels in English and stores object and field labels as they were then
export const translatePersistedOutputSchemaLabels = ({
  stepType,
  outputSchema,
  objectMetadataItems = [],
}: {
  stepType: keyof typeof WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS;
  outputSchema: Record<string, unknown>;
  objectMetadataItems?: EnrichedObjectMetadataItem[];
}): OutputSchemaV2 => {
  const objectMetadataId = findObjectMetadataId(outputSchema);

  return translateOutputSchema({
    outputSchema,
    path: [],
    context: {
      stepType,
      labelEntries: Object.entries(
        WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS[stepType] ?? {},
      ),
      objectMetadataItems,
      stepObjectMetadataItem: isDefined(objectMetadataId)
        ? findObjectMetadataItem({ objectMetadataItems, objectMetadataId })
        : undefined,
    },
  });
};
