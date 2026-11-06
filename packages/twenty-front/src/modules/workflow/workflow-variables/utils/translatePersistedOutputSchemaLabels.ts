import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS } from '@/workflow/workflow-variables/constants/WorkflowPersistedOutputSchemaLabels';
import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import {
  type FieldOutputSchemaV2,
  type RecordOutputSchemaV2,
} from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isRecordOutputSchemaV2';
import { t } from '@lingui/core/macro';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { isBaseOutputSchemaV2 } from 'twenty-shared/workflow';

// server labels whose object name the front shows in the viewer's language
const OBJECT_LABEL_PATTERNS: Array<{
  stepType: string;
  key: string;
  pattern: RegExp;
  translate: (objectLabel: string) => string;
}> = [
  {
    stepType: 'ITERATOR',
    key: 'currentItem',
    pattern: /^Current Item \((.+)\)$/,
    translate: (objectLabel) => t`Current Item (${objectLabel})`,
  },
  {
    stepType: 'FIND_RECORDS',
    key: 'first',
    pattern: /^First (.+)$/,
    translate: (objectLabel) => t`First ${objectLabel}`,
  },
  {
    stepType: 'FIND_RECORDS',
    key: 'all',
    pattern: /^All (.+)$/,
    translate: (objectLabel) => t`All ${objectLabel}`,
  },
  {
    stepType: 'WAIT_FOR_EVENT',
    key: 'before',
    pattern: /^(.+) Before Update$/,
    translate: (objectLabel) => t`${objectLabel} Before Update`,
  },
];

type TranslationContext = {
  stepType: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
};

const findObjectMetadataItem = (
  objectMetadataItems: EnrichedObjectMetadataItem[],
  objectMetadataId: string,
) => objectMetadataItems.find(({ id }) => id === objectMetadataId);

const findSchemaObjectMetadataId = (value: unknown): string | undefined => {
  if (isRecordOutputSchemaV2(value)) {
    return value.object.objectMetadataId;
  }

  if (!isPlainObject(value)) {
    return undefined;
  }

  for (const entry of Object.values(value)) {
    const objectMetadataId = isPlainObject(entry)
      ? findSchemaObjectMetadataId(entry.value)
      : undefined;

    if (isDefined(objectMetadataId)) {
      return objectMetadataId;
    }
  }

  return undefined;
};

const translateLabel = ({
  key,
  label,
  stepObjectMetadataItem,
  stepType,
}: {
  key: string;
  label: string;
  stepObjectMetadataItem?: EnrichedObjectMetadataItem;
  stepType: string;
}): string => {
  const persistedLabel = WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS.find(
    (persistedLabel) =>
      persistedLabel.stepType === stepType &&
      persistedLabel.key === key &&
      persistedLabel.label === label,
  );

  if (isDefined(persistedLabel)) {
    return t(persistedLabel.message);
  }

  for (const objectLabelPattern of OBJECT_LABEL_PATTERNS) {
    if (
      objectLabelPattern.stepType !== stepType ||
      objectLabelPattern.key !== key
    ) {
      continue;
    }

    const objectLabel = objectLabelPattern.pattern.exec(label)?.[1];

    if (isDefined(objectLabel)) {
      const isPluralLabel = key === 'all';

      return objectLabelPattern.translate(
        (isPluralLabel
          ? stepObjectMetadataItem?.labelPlural
          : stepObjectMetadataItem?.labelSingular) ?? objectLabel,
      );
    }
  }

  return label;
};

const translateRecordOutputSchema = (
  recordOutputSchema: RecordOutputSchemaV2,
  context: TranslationContext,
): RecordOutputSchemaV2 => {
  const objectMetadataItem = findObjectMetadataItem(
    context.objectMetadataItems,
    recordOutputSchema.object.objectMetadataId,
  );

  const translateField = (
    key: string,
    field: FieldOutputSchemaV2,
  ): FieldOutputSchemaV2 => {
    const fieldMetadataItem = objectMetadataItem?.fields.find(
      ({ id }) => id === field.fieldMetadataId,
    );

    // relation id fields carry their own label, so only a field shown under its own name takes the field label
    const translatedField = {
      ...field,
      label:
        isDefined(fieldMetadataItem) &&
        key.split('.').pop() === fieldMetadataItem.name
          ? fieldMetadataItem.label
          : field.label,
    } as FieldOutputSchemaV2;

    if (!translatedField.isLeaf && isRecordOutputSchemaV2(field.value)) {
      return {
        ...translatedField,
        value: translateRecordOutputSchema(field.value, context),
      };
    }

    return translatedField;
  };

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
        translateField(key, field),
      ]),
    ),
  };
};

const translateOutputSchema = (
  outputSchema: unknown,
  context: TranslationContext,
): OutputSchemaV2 => {
  if (isRecordOutputSchemaV2(outputSchema)) {
    return translateRecordOutputSchema(outputSchema, context);
  }

  if (!isPlainObject(outputSchema)) {
    return {};
  }

  const stepObjectMetadataId = findSchemaObjectMetadataId(outputSchema);
  const stepObjectMetadataItem = isDefined(stepObjectMetadataId)
    ? findObjectMetadataItem(context.objectMetadataItems, stepObjectMetadataId)
    : undefined;

  return Object.fromEntries(
    Object.entries(outputSchema).map(([key, entry]) => {
      if (!isPlainObject(entry)) {
        return [key, entry];
      }

      const translatedEntry = {
        ...entry,
        ...(typeof entry.label === 'string'
          ? {
              label: translateLabel({
                key,
                label: entry.label,
                stepObjectMetadataItem,
                stepType: context.stepType,
              }),
            }
          : {}),
      };

      return entry.isLeaf === false
        ? [
            key,
            {
              ...translatedEntry,
              value: translateOutputSchema(entry.value, context),
            },
          ]
        : [key, translatedEntry];
    }),
  ) as OutputSchemaV2;
};

// the server writes output schemas in English, with the object and field labels it stores
export const translatePersistedOutputSchemaLabels = ({
  stepType,
  outputSchema,
  objectMetadataItems = [],
}: {
  stepType: string;
  outputSchema: unknown;
  objectMetadataItems?: EnrichedObjectMetadataItem[];
}): OutputSchemaV2 =>
  isRecordOutputSchemaV2(outputSchema) || isBaseOutputSchemaV2(outputSchema)
    ? translateOutputSchema(outputSchema, { stepType, objectMetadataItems })
    : {};
