import {
  BaseOutputSchema,
  OutputSchema,
  RecordOutputSchema,
} from '@/workflow/workflow-variables/types/StepOutputSchema';
import { isBaseOutputSchema } from '@/workflow/workflow-variables/utils/isBaseOutputSchema';
import { isLinkOutputSchema } from '@/workflow/workflow-variables/utils/isLinkOutputSchema';
import { isRecordOutputSchema } from '@/workflow/workflow-variables/utils/isRecordOutputSchema';
import { isDefined } from 'twenty-ui';

const isValidRecordOutputSchema = (
  outputSchema: RecordOutputSchema,
  objectNameSingularToSelect?: string,
): boolean => {
  if (isDefined(objectNameSingularToSelect)) {
    return (
      isDefined(outputSchema.object) &&
      outputSchema.object.nameSingular === objectNameSingularToSelect
    );
  }

  return true;
};

const filterRecordOutputSchema = (
  outputSchema: RecordOutputSchema,
  objectNameSingularToSelect: string,
): RecordOutputSchema | undefined => {
  const filteredFields: BaseOutputSchema = {};
  let hasValidFields = false;

  for (const key in outputSchema.fields) {
    const field = outputSchema.fields[key];

    if (field.isLeaf) {
      continue;
    }

    const validSubSchema = filterOutputSchema(
      field.value,
      objectNameSingularToSelect,
    );
    if (isDefined(validSubSchema)) {
      filteredFields[key] = {
        ...field,
        value: validSubSchema,
      };
      hasValidFields = true;
    }
  }

  if (isValidRecordOutputSchema(outputSchema, objectNameSingularToSelect)) {
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

const filterBaseOutputSchema = (
  outputSchema: BaseOutputSchema,
  objectNameSingularToSelect: string,
): BaseOutputSchema | undefined => {
  const filteredSchema: BaseOutputSchema = {};
  let hasValidFields = false;

  for (const key in outputSchema) {
    const field = outputSchema[key];

    if (field.isLeaf) {
      continue;
    }

    const validSubSchema = filterOutputSchema(
      field.value,
      objectNameSingularToSelect,
    );
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

export const filterOutputSchema = (
  outputSchema?: OutputSchema,
  objectNameSingularToSelect?: string,
): OutputSchema | undefined => {
  if (!objectNameSingularToSelect || !outputSchema) {
    return outputSchema;
  }

  if (isLinkOutputSchema(outputSchema)) {
    return outputSchema;
  } else if (isRecordOutputSchema(outputSchema)) {
    return filterRecordOutputSchema(outputSchema, objectNameSingularToSelect);
  } else if (isBaseOutputSchema(outputSchema)) {
    return filterBaseOutputSchema(outputSchema, objectNameSingularToSelect);
  }

  return undefined;
};
