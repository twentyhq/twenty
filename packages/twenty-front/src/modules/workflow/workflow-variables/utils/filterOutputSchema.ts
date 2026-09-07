import {
  type InputSchemaPropertyType,
  type BaseOutputSchemaV2,
  type Node,
} from 'twenty-shared/workflow';
import {
  type FieldOutputSchemaV2,
  type RecordOutputSchemaV2,
} from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { isBaseOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isBaseOutputSchemaV2';
import { isLinkOutputSchema } from '@/workflow/workflow-variables/types/guards/isLinkOutputSchema';
import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isRecordOutputSchemaV2';
import { isFieldTypeCompatibleWithRecordId } from '@/workflow/workflow-variables/utils/isFieldTypeCompatibleWithRecordId';
import { isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

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

    if (field.isLeaf) {
      filteredFields[key] = field;
      continue;
    }

    const filteredValue = isRecordOutputSchemaV2(field.value)
      ? filterRecordOutputSchemaFieldsByType({
          outputSchema: field.value,
          fieldTypesToExclude,
        })
      : filterNonRecordOutputSchemaFieldsByType({
          outputSchema: field.value,
          fieldTypesToExclude,
        });

    filteredFields[key] = {
      ...field,
      value: filteredValue,
    };
  }

  return {
    ...outputSchema,
    fields: filteredFields,
  };
};

function filterNonRecordOutputSchemaFieldsByType<
  TOutputSchema extends OutputSchemaV2,
>({
  outputSchema,
  fieldTypesToExclude,
}: {
  outputSchema: TOutputSchema;
  fieldTypesToExclude: InputSchemaPropertyType[];
}): TOutputSchema;
function filterNonRecordOutputSchemaFieldsByType({
  outputSchema,
  fieldTypesToExclude,
}: {
  outputSchema: OutputSchemaV2;
  fieldTypesToExclude: InputSchemaPropertyType[];
}): OutputSchemaV2 {
  const filteredEntries = Object.entries(outputSchema)
    .map(([key, field]) => {
      if (!isObject(field)) {
        return [key, field];
      }

      if (
        'type' in field &&
        fieldTypesToExclude.some((fieldType) => fieldType === field.type)
      ) {
        return undefined;
      }

      if (
        'isLeaf' in field &&
        field.isLeaf === false &&
        'value' in field &&
        isObject(field.value)
      ) {
        return [
          key,
          {
            ...field,
            value: isRecordOutputSchemaV2(field.value)
              ? filterRecordOutputSchemaFieldsByType({
                  outputSchema: field.value,
                  fieldTypesToExclude,
                })
              : filterNonRecordOutputSchemaFieldsByType({
                  outputSchema: field.value,
                  fieldTypesToExclude,
                }),
          },
        ];
      }

      return [key, field];
    })
    .filter(isDefined);

  return Object.fromEntries(filteredEntries);
}

const filterOutputSchemaFieldsByType = ({
  outputSchema,
  fieldTypesToExclude,
}: {
  outputSchema: OutputSchemaV2;
  fieldTypesToExclude: InputSchemaPropertyType[];
}): OutputSchemaV2 => {
  if (isRecordOutputSchemaV2(outputSchema)) {
    return filterRecordOutputSchemaFieldsByType({
      outputSchema,
      fieldTypesToExclude,
    });
  }

  if (isLinkOutputSchema(outputSchema)) {
    return outputSchema;
  }

  return filterNonRecordOutputSchemaFieldsByType({
    outputSchema,
    fieldTypesToExclude,
  });
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

  const filteredOutputSchema = isDefined(fieldTypesToExclude)
    ? filterOutputSchemaFieldsByType({
        outputSchema,
        fieldTypesToExclude,
      })
    : outputSchema;

  if (!shouldDisplayRecordObjects || shouldDisplayRecordFields) {
    return filteredOutputSchema;
  }

  if (isLinkOutputSchema(filteredOutputSchema)) {
    return filteredOutputSchema;
  } else if (isRecordOutputSchemaV2(filteredOutputSchema)) {
    return filterRecordOutputSchema({
      outputSchema: filteredOutputSchema,
      shouldDisplayRecordFields,
      shouldDisplayRecordObjects,
    });
  } else if (isBaseOutputSchemaV2(filteredOutputSchema)) {
    return filterBaseOutputSchema({
      outputSchema: filteredOutputSchema,
      shouldDisplayRecordFields,
      shouldDisplayRecordObjects,
    });
  }

  return undefined;
};
