import { isNonEmptyString, isString } from '@sniptt/guards';
import {
  type InputJsonSchema,
  jsonSchemaToInputSchema,
} from 'twenty-shared/logic-function';
import { capitalize, isPlainObject } from 'twenty-shared/utils';

import { type ToolArgumentField } from '@/workflow/workflow-steps/workflow-actions/send-chat-message-action/types/ToolArgumentField';

const SIMPLE_TYPES = new Set(['string', 'number', 'integer', 'boolean']);

const hasSimpleInput = (propertySchema: Record<string, unknown>): boolean => {
  if (SIMPLE_TYPES.has(String(propertySchema.type))) {
    return true;
  }

  return (
    propertySchema.type === 'array' &&
    isPlainObject(propertySchema.items) &&
    propertySchema.items.type === 'string'
  );
};

const toLabel = (name: string) =>
  capitalize(name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase());

// null when the schema lists no arguments, so the arguments are edited as JSON
export const buildToolArgumentFields = (
  jsonSchema: unknown,
): ToolArgumentField[] | null => {
  if (!isPlainObject(jsonSchema) || !isPlainObject(jsonSchema.properties)) {
    return null;
  }

  const requiredNames = Array.isArray(jsonSchema.required)
    ? jsonSchema.required.filter(isString)
    : [];

  const fields = Object.entries(jsonSchema.properties).flatMap(
    ([name, propertySchema]): ToolArgumentField[] => {
      if (!isPlainObject(propertySchema)) {
        return [];
      }

      return [
        {
          name,
          label: isNonEmptyString(propertySchema.title)
            ? propertySchema.title
            : toLabel(name),
          description: isNonEmptyString(propertySchema.description)
            ? propertySchema.description
            : undefined,
          isRequired: requiredNames.includes(name),
          schemaProperty: hasSimpleInput(propertySchema)
            ? jsonSchemaToInputSchema(propertySchema as InputJsonSchema)[0]
            : undefined,
        },
      ];
    },
  );

  if (fields.length === 0) {
    return null;
  }

  return [
    ...fields.filter((field) => field.isRequired),
    ...fields.filter((field) => !field.isRequired),
  ];
};
