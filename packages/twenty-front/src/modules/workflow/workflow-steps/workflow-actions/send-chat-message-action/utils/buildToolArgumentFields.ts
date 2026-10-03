import { isNonEmptyString, isString } from '@sniptt/guards';
import {
  type InputJsonSchema,
  jsonSchemaToInputSchema,
} from 'twenty-shared/logic-function';
import { capitalize, isPlainObject } from 'twenty-shared/utils';

import { type ToolArgumentField } from '@/workflow/workflow-steps/workflow-actions/send-chat-message-action/types/ToolArgumentField';

const SIMPLE_TYPES = new Set(['string', 'number', 'integer', 'boolean']);

const isSimpleInputJsonSchema = (
  propertySchema: Record<string, unknown>,
): propertySchema is InputJsonSchema =>
  SIMPLE_TYPES.has(String(propertySchema.type)) ||
  (propertySchema.type === 'array' &&
    isPlainObject(propertySchema.items) &&
    propertySchema.items.type === 'string');

const toLabel = (name: string) =>
  capitalize(name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase());

const buildJsonField = ({
  name,
  isRequired,
  isListed,
}: {
  name: string;
  isRequired: boolean;
  isListed: boolean;
}): ToolArgumentField => ({
  name,
  label: toLabel(name),
  isRequired,
  isListed,
});

// null when the schema lists no arguments, so the arguments are edited as JSON
export const buildToolArgumentFields = ({
  jsonSchema,
  savedArgumentNames,
}: {
  jsonSchema: unknown;
  savedArgumentNames: string[];
}): ToolArgumentField[] | null => {
  if (!isPlainObject(jsonSchema) || !isPlainObject(jsonSchema.properties)) {
    return null;
  }

  const { properties } = jsonSchema;
  const requiredNames = new Set(
    Array.isArray(jsonSchema.required)
      ? jsonSchema.required.filter(isString)
      : [],
  );

  const listedFields = Object.entries(properties).flatMap(
    ([name, propertySchema]): ToolArgumentField[] =>
      isPlainObject(propertySchema)
        ? [
            {
              name,
              label: isNonEmptyString(propertySchema.title)
                ? propertySchema.title
                : toLabel(name),
              description: isNonEmptyString(propertySchema.description)
                ? propertySchema.description
                : undefined,
              isRequired: requiredNames.has(name),
              isListed: true,
              schemaProperty: isSimpleInputJsonSchema(propertySchema)
                ? jsonSchemaToInputSchema(propertySchema)[0]
                : undefined,
            },
          ]
        : [],
  );
  const unlistedRequiredFields = [...requiredNames]
    .filter((name) => !Object.hasOwn(properties, name))
    .map((name) => buildJsonField({ name, isRequired: true, isListed: true }));
  const unlistedSavedFields = savedArgumentNames
    .filter(
      (name) => !Object.hasOwn(properties, name) && !requiredNames.has(name),
    )
    .map((name) =>
      buildJsonField({ name, isRequired: false, isListed: false }),
    );

  const fields = [
    ...listedFields,
    ...unlistedRequiredFields,
    ...unlistedSavedFields,
  ];

  if (fields.length === 0) {
    return null;
  }

  return [
    ...fields.filter((field) => field.isRequired),
    ...fields.filter((field) => !field.isRequired),
  ];
};
