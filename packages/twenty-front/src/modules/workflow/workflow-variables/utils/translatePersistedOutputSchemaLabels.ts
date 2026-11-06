import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import {
  WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS,
  type WorkflowPersistedOutputSchemaLabel,
} from '@/workflow/workflow-variables/constants/WorkflowPersistedOutputSchemaLabels';
import {
  type FieldOutputSchemaV2,
  type RecordOutputSchemaV2,
} from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isRecordOutputSchemaV2';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  type BaseOutputSchemaV2,
  isBaseOutputSchemaV2,
} from 'twenty-shared/workflow';

type TranslationContext = {
  labels: Record<string, WorkflowPersistedOutputSchemaLabel>;
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

const translateLabel = ({
  path,
  node,
  context,
}: {
  path: string[];
  node: BaseOutputSchemaV2[string];
  context: TranslationContext;
}): string => {
  const label = Object.entries(context.labels).find(([labelPath]) =>
    matchesPath({ labelPath, path }),
  )?.[1];

  if (!isDefined(label)) {
    return node.label;
  }

  if (typeof label !== 'function') {
    return t(label);
  }

  return (
    label({
      objectMetadataItem: context.stepObjectMetadataItem,
      value: node.value,
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
  outputSchema: unknown;
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
      labels: WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS[stepType] ?? {},
      objectMetadataItems,
      stepObjectMetadataItem: isDefined(objectMetadataId)
        ? findObjectMetadataItem({ objectMetadataItems, objectMetadataId })
        : undefined,
    },
  });
};
