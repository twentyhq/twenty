import { isDefined } from 'twenty-shared/utils';

const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

const PROTOTYPE_KEY = '__proto__';

export type EnumSymbolResolver = (params: {
  path: string[];
  value: string;
}) => string | undefined;

const printString = (value: string): string =>
  `'${value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')}'`;

const printKey = (key: string): string => {
  if (key === PROTOTYPE_KEY) {
    return `[${printString(key)}]`;
  }

  return IDENTIFIER_PATTERN.test(key) ? key : printString(key);
};

const indentOf = (depth: number): string => '  '.repeat(depth);

export const printTypescriptValue = ({
  value,
  depth = 0,
  path = [],
  resolveEnumSymbol,
}: {
  value: unknown;
  depth?: number;
  path?: string[];
  resolveEnumSymbol?: EnumSymbolResolver;
}): string => {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'string') {
    const enumSymbol = resolveEnumSymbol?.({ path, value });

    return isDefined(enumSymbol) ? enumSymbol : printString(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }

    const items = value.map(
      (item) =>
        `${indentOf(depth + 1)}${printTypescriptValue({
          value: item,
          depth: depth + 1,
          path: [...path, '[]'],
          resolveEnumSymbol,
        })},`,
    );

    return `[\n${items.join('\n')}\n${indentOf(depth)}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, entryValue]) => entryValue !== undefined,
    );

    if (entries.length === 0) {
      return '{}';
    }

    const properties = entries.map(
      ([key, entryValue]) =>
        `${indentOf(depth + 1)}${printKey(key)}: ${printTypescriptValue({
          value: entryValue,
          depth: depth + 1,
          path: [...path, key],
          resolveEnumSymbol,
        })},`,
    );

    return `{\n${properties.join('\n')}\n${indentOf(depth)}}`;
  }

  return 'null';
};
