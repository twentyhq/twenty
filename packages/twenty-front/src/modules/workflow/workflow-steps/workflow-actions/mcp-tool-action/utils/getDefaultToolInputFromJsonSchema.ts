import { isNonEmptyArray } from '@sniptt/guards';
import { type InputJsonSchema } from 'twenty-shared/logic-function';
import { type FunctionInput } from 'twenty-shared/workflow';

const getDefaultPropertyValue = ({
  property,
  isRequired,
}: {
  property: InputJsonSchema;
  isRequired: boolean;
}): FunctionInput => {
  if (property.type === 'object') {
    return getDefaultToolInputFromJsonSchema(property);
  }

  if (!isRequired) {
    return null;
  }

  if (property.type === 'array') {
    return [];
  }

  return isNonEmptyArray(property.enum) ? (property.enum[0] as string) : null;
};

// Optional inputs stay null until the author fills them, so the tool never receives a seeded [] or first enum value.
export const getDefaultToolInputFromJsonSchema = (
  jsonSchema: InputJsonSchema,
): FunctionInput =>
  Object.fromEntries(
    Object.entries(jsonSchema.properties ?? {}).map(([key, property]) => [
      key,
      getDefaultPropertyValue({
        property,
        isRequired: (jsonSchema.required ?? []).includes(key),
      }),
    ]),
  );
