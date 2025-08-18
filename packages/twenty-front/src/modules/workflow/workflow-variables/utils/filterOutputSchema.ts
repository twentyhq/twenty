import { type InputSchemaPropertyType } from '@/workflow/types/InputSchema';
import {
  type BaseOutputSchema,
  type FieldOutputSchema,
  type OutputSchema,
  type RecordOutputSchema,
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
  const filteredFields: Record<string, FieldOutputSchema> = {};
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

const filterRecordOutputSchemaFieldsByType = ({
  outputSchema,
  fieldTypesToExclude,
}: {
  outputSchema: RecordOutputSchema;
  fieldTypesToExclude: InputSchemaPropertyType[];
}): RecordOutputSchema => {
  const filteredFields: Record<string, FieldOutputSchema> = {};

  for (const key in outputSchema.fields) {
    const field = outputSchema.fields[key];

    if (isDefined(field.type) && fieldTypesToExclude.includes(field.type)) {
      continue;
    }

    filteredFields[key] = field;
  }

  return {
    ...outputSchema,
    // Relations could be filtered recursively but this util requires a global simplification first
    fields: filteredFields,
  };
};

export const filterOutputSchema = ({
  shouldDisplayRecordFields,
  shouldDisplayRecordObjects,
  outputSchema,
  fieldTypesToExclude,
}: {
  shouldDisplayRecordFields: boolean;
  shouldDisplayRecordObjects: boolean;
  outputSchema?: OutputSchema;
  fieldTypesToExclude?: InputSchemaPropertyType[];
}): OutputSchema | undefined => {
  if (!isDefined(outputSchema)) {
    return undefined;
  }

  if (!shouldDisplayRecordObjects || shouldDisplayRecordFields) {
    if (isRecordOutputSchema(outputSchema) && isDefined(fieldTypesToExclude)) {
      return filterRecordOutputSchemaFieldsByType({
        outputSchema,
        fieldTypesToExclude,
      });
    }

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
