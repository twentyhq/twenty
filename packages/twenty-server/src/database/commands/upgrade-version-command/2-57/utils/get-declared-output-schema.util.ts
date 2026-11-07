import { isPlainObject } from 'twenty-shared/utils';

// frozen copy of twenty-shared's inputSchemaToOutputSchema as of 2.57, so this command keeps its rule
const LEAF_TYPES = new Set(['string', 'number', 'boolean', 'array', 'unknown']);

const convertProperties = (
  properties: Record<string, unknown>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(properties).map(([key, property]) => [
      key,
      convertProperty({ key, property }),
    ]),
  );

const convertProperty = ({
  key,
  property,
}: {
  key: string;
  property: unknown;
}): Record<string, unknown> => {
  const {
    type,
    label: declaredLabel,
    properties,
  } = isPlainObject(property) ? property : {};
  const label = typeof declaredLabel === 'string' ? declaredLabel : key;

  if (type === 'record') {
    return { isLeaf: true, type: 'string', label, value: null };
  }

  if (type === 'records') {
    return { isLeaf: true, type: 'array', label, value: null };
  }

  if (type === 'object') {
    return {
      isLeaf: false,
      type: 'object',
      label,
      value: isPlainObject(properties) ? convertProperties(properties) : {},
    };
  }

  return {
    isLeaf: true,
    type: typeof type === 'string' && LEAF_TYPES.has(type) ? type : 'unknown',
    label,
    value: null,
  };
};

export const getDeclaredOutputSchema = (
  declaredInputSchema: unknown,
): Record<string, unknown> => {
  const root = Array.isArray(declaredInputSchema)
    ? declaredInputSchema[0]
    : undefined;

  if (
    !isPlainObject(root) ||
    root.type !== 'object' ||
    !isPlainObject(root.properties)
  ) {
    return {};
  }

  return convertProperties(root.properties);
};
