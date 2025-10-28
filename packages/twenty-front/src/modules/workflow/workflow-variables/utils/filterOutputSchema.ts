import { type InputSchemaPropertyType } from '@/workflow/types/InputSchema';
import {
  type FieldOutputSchemaV2,
  type RecordOutputSchemaV2,
} from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { isBaseOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isBaseOutputSchemaV2';
import { isLinkOutputSchema } from '@/workflow/workflow-variables/types/guards/isLinkOutputSchema';
import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isRecordOutputSchemaV2';
import { isFieldTypeCompatibleWithRecordId } from '@/workflow/workflow-variables/utils/isFieldTypeCompatibleWithRecordId';
import { isDefined } from 'twenty-shared/utils';
import { type BaseOutputSchemaV2, type Node } from 'twenty-shared/workflow';

const isValidRecordOutputSchema = ({
  shouldDisplayRecordFields,
  shouldDisplayRecordObjects,
  outputSchema,
}: {
  shouldDisplayRecordFields: boolean;
  shouldDisplayRecordObjects: boolean;
  outputSchema: RecordOutputSchemaV2;
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
  outputSchema: RecordOutputSchemaV2;
  shouldDisplayRecordFields: boolean;
  shouldDisplayRecordObjects: boolean;
}): RecordOutputSchemaV2 | undefined => {
  const filteredFields: Record<string, FieldOutputSchemaV2> = {};
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
      } as FieldOutputSchemaV2;
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
    } as RecordOutputSchemaV2;
  }

  return undefined;
};

const filterBaseOutputSchema = ({
  outputSchema,
  shouldDisplayRecordFields,
  shouldDisplayRecordObjects,
}: {
  outputSchema: BaseOutputSchemaV2;
  shouldDisplayRecordFields: boolean;
  shouldDisplayRecordObjects: boolean;
}): BaseOutputSchemaV2 | undefined => {
  const filteredSchema: BaseOutputSchemaV2 = {};
  let hasValidFields = false;

  for (const key in outputSchema) {
    const field = outputSchema[key];

    if (!isDefined(field)) {
      continue;
    }

    if (field.isLeaf === true) {
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
      } as Node;
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
  outputSchema: RecordOutputSchemaV2;
  fieldTypesToExclude: InputSchemaPropertyType[];
}): RecordOutputSchemaV2 => {
  const filteredFields: Record<string, FieldOutputSchemaV2> = {};

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
  outputSchema?: OutputSchemaV2;
  fieldTypesToExclude?: InputSchemaPropertyType[];
}): OutputSchemaV2 | undefined => {
  if (!isDefined(outputSchema)) {
    return undefined;
  }

  if (!shouldDisplayRecordObjects || shouldDisplayRecordFields) {
    if (
      isRecordOutputSchemaV2(outputSchema) &&
      isDefined(fieldTypesToExclude)
    ) {
      return filterRecordOutputSchemaFieldsByType({
        outputSchema,
        fieldTypesToExclude,
      });
    }

    return outputSchema;
  }

  if (isLinkOutputSchema(outputSchema)) {
    return outputSchema;
  } else if (isRecordOutputSchemaV2(outputSchema)) {
    return filterRecordOutputSchema({
      outputSchema,
      shouldDisplayRecordFields,
      shouldDisplayRecordObjects,
    });
  } else if (isBaseOutputSchemaV2(outputSchema)) {
    return filterBaseOutputSchema({
      outputSchema,
      shouldDisplayRecordFields,
      shouldDisplayRecordObjects,
    });
  }

  return undefined;
};
