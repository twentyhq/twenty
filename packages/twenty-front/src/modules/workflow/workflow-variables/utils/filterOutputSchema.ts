import {
  BaseOutputSchema,
  OutputSchema,
  RecordOutputSchema,
} from '@/workflow/workflow-variables/types/StepOutputSchema';
import { isBaseOutputSchema } from '@/workflow/workflow-variables/utils/isBaseOutputSchema';
import { isFieldTypeCompatibleWithRecordId } from '@/workflow/workflow-variables/utils/isFieldTypeCompatibleWithRecordId';
import { isLinkOutputSchema } from '@/workflow/workflow-variables/utils/isLinkOutputSchema';
import { isRecordOutputSchema } from '@/workflow/workflow-variables/utils/isRecordOutputSchema';
import { isDefined } from 'twenty-shared/utils';

const isValidRecordOutputSchema = ({
  shouldDisplayRecordFields,
  shouldDisplayRecordObjects,
  outputSchema,
}: {
  shouldDisplayRecordFields: boolean;
  shouldDisplayRecordObjects: boolean;
  outputSchema: RecordOutputSchema;
}): boolean => {
  if (shouldDisplayRecordObjects && !shouldDisplayRecordFields) {
    return isDefined(outputSchema.object);
  }

  return true;
};

const filterRecordOutputSchema = ({
  outputSchema,
  shouldDisplayRecordFields,
  shouldDisplayRecordObjects,
}: {
  outputSchema: RecordOutputSchema;
  shouldDisplayRecordFields: boolean;
  shouldDisplayRecordObjects: boolean;
}): RecordOutputSchema | undefined => {
  const filteredFields: BaseOutputSchema = {};
  let hasValidFields = false;

  for (const key in outputSchema.fields) {
    const field = outputSchema.fields[key];

    if (field.isLeaf) {
      if (isFieldTypeCompatibleWithRecordId(field.type)) {
        filteredFields[key] = field;
        hasValidFields = true;
      }
      continue;
    }

    const validSubSchema = filterOutputSchema({
      outputSchema: field.value,
      shouldDisplayRecordFields,
      shouldDisplayRecordObjects,
    });

    if (isDefined(validSubSchema)) {
      filteredFields[key] = {
        ...field,
        value: validSubSchema,
      };
      hasValidFields = true;
    }
  }

  if (
    isValidRecordOutputSchema({
      shouldDisplayRecordFields,
      shouldDisplayRecordObjects,
      outputSchema,
    })
  ) {
    return {
      ...outputSchema,
      fields: filteredFields,
    };
  } else if (hasValidFields) {
    return {
      _outputSchemaType: 'RECORD',
      fields: filteredFields,
    } as RecordOutputSchema;
  }

  return undefined;
};

const filterBaseOutputSchema = ({
  outputSchema,
  shouldDisplayRecordFields,
  shouldDisplayRecordObjects,
}: {
  outputSchema: BaseOutputSchema;
  shouldDisplayRecordFields: boolean;
  shouldDisplayRecordObjects: boolean;
}): BaseOutputSchema | undefined => {
  const filteredSchema: BaseOutputSchema = {};
  let hasValidFields = false;

  for (const key in outputSchema) {
    const field = outputSchema[key];

    if (field.isLeaf) {
      if (isFieldTypeCompatibleWithRecordId(field.type)) {
        filteredSchema[key] = field;
        hasValidFields = true;
      }
      continue;
    }

    const validSubSchema = filterOutputSchema({
      shouldDisplayRecordFields,
      shouldDisplayRecordObjects,
      outputSchema: field.value,
    });
    if (isDefined(validSubSchema)) {
      filteredSchema[key] = {
        ...field,
        value: validSubSchema,
      };
      hasValidFields = true;
    }
  }

  if (hasValidFields) {
    return filteredSchema;
  }

  return undefined;
};

export const filterOutputSchema = ({
  shouldDisplayRecordFields,
  shouldDisplayRecordObjects,
  outputSchema,
}: {
  shouldDisplayRecordFields: boolean;
  shouldDisplayRecordObjects: boolean;
  outputSchema?: OutputSchema;
}): OutputSchema | undefined => {
  if (
    !shouldDisplayRecordObjects ||
    shouldDisplayRecordFields ||
    !outputSchema
  ) {
    return outputSchema;
  }

  if (isLinkOutputSchema(outputSchema)) {
    return outputSchema;
  } else if (isRecordOutputSchema(outputSchema)) {
    return filterRecordOutputSchema({
      outputSchema,
      shouldDisplayRecordFields,
      shouldDisplayRecordObjects,
    });
  } else if (isBaseOutputSchema(outputSchema)) {
    return filterBaseOutputSchema({
      outputSchema,
      shouldDisplayRecordFields,
      shouldDisplayRecordObjects,
    });
  }

  return undefined;
};
