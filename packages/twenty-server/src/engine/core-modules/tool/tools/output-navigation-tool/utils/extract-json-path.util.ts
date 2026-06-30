import { isNull, isObject, isString } from '@sniptt/guards';
import { EXTRACT_JSON_PATHS_MAX_LEAF_STRING_LENGTH } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/extract-json-paths-max-leaf-string-length.constant';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export class JsonPathError extends Error {}

type Accessor =
  | { type: 'key'; key: string }
  | { type: 'index'; index: number }
  | { type: 'slice'; start?: number; end?: number }
  | { type: 'wildcard' };

const KEY_DOT_REGEX = /^\.([a-zA-Z_$][a-zA-Z0-9_$]*)/;
const KEY_DOUBLE_QUOTE_REGEX = /^\["((?:[^"\\]|\\.)*)"\]/;
const KEY_SINGLE_QUOTE_REGEX = /^\['((?:[^'\\]|\\.)*)'\]/;
const WILDCARD_REGEX = /^\[\*\]/;
const SLICE_REGEX = /^\[(-?\d+)?:(-?\d+)?\]/;
const INDEX_REGEX = /^\[(-?\d+)\]/;

const unescapeQuotedKey = (key: string): string => key.replace(/\\(.)/g, '$1');

const describeType = (value: unknown): string => {
  if (isNull(value)) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  return typeof value;
};

export const parseJsonPath = (path: string): Accessor[] => {
  let rest = path.trim();

  if (rest === '' || rest === '$') {
    return [];
  }

  if (!rest.startsWith('$')) {
    throw new JsonPathError('Path must start with "$"');
  }

  rest = rest.slice(1);

  const accessors: Accessor[] = [];

  while (rest.length > 0) {
    let match: RegExpExecArray | null;

    if ((match = KEY_DOT_REGEX.exec(rest))) {
      accessors.push({ type: 'key', key: match[1] });
    } else if (
      (match = KEY_DOUBLE_QUOTE_REGEX.exec(rest)) ||
      (match = KEY_SINGLE_QUOTE_REGEX.exec(rest))
    ) {
      accessors.push({ type: 'key', key: unescapeQuotedKey(match[1]) });
    } else if ((match = WILDCARD_REGEX.exec(rest))) {
      accessors.push({ type: 'wildcard' });
    } else if ((match = SLICE_REGEX.exec(rest))) {
      accessors.push({
        type: 'slice',
        start: isDefined(match[1]) ? Number(match[1]) : undefined,
        end: isDefined(match[2]) ? Number(match[2]) : undefined,
      });
    } else if ((match = INDEX_REGEX.exec(rest))) {
      accessors.push({ type: 'index', index: Number(match[1]) });
    } else {
      throw new JsonPathError(`Unexpected token in path near "${rest}"`);
    }

    rest = rest.slice(match[0].length);
  }

  return accessors;
};

const resolveAccessors = (value: unknown, accessors: Accessor[]): unknown => {
  if (!isNonEmptyArray(accessors)) {
    return value;
  }

  const [head, ...rest] = accessors;

  switch (head.type) {
    case 'key': {
      if (isNull(value) || !isObject(value) || Array.isArray(value)) {
        throw new JsonPathError(
          `Cannot read key "${head.key}" on ${describeType(value)}`,
        );
      }

      const record = value as Record<string, unknown>;

      if (!Object.prototype.hasOwnProperty.call(record, head.key)) {
        throw new JsonPathError(`Key "${head.key}" not found`);
      }

      return resolveAccessors(record[head.key], rest);
    }
    case 'index': {
      if (!Array.isArray(value)) {
        throw new JsonPathError(`Cannot index ${describeType(value)}`);
      }

      const index = head.index < 0 ? value.length + head.index : head.index;

      if (index < 0 || index >= value.length) {
        throw new JsonPathError(`Index ${head.index} is out of range`);
      }

      return resolveAccessors(value[index], rest);
    }
    case 'slice': {
      if (!Array.isArray(value)) {
        throw new JsonPathError(`Cannot slice ${describeType(value)}`);
      }

      return resolveAccessors(value.slice(head.start, head.end), rest);
    }
    case 'wildcard': {
      if (Array.isArray(value)) {
        return value.map((child) => resolveAccessors(child, rest));
      }

      if (isObject(value)) {
        return Object.values(value).map((child) =>
          resolveAccessors(child, rest),
        );
      }

      throw new JsonPathError(
        `Cannot apply wildcard to ${describeType(value)}`,
      );
    }
  }
};

const boundScalar = (value: unknown): unknown => {
  if (
    isString(value) &&
    value.length > EXTRACT_JSON_PATHS_MAX_LEAF_STRING_LENGTH
  ) {
    return `${value.slice(0, EXTRACT_JSON_PATHS_MAX_LEAF_STRING_LENGTH)}… (truncated, ${value.length} chars total)`;
  }

  return value;
};

export const boundValue = (
  value: unknown,
  maxItems: number,
  maxDepth: number,
  depth = 0,
): unknown => {
  if (isNull(value) || !isObject(value)) {
    return boundScalar(value);
  }

  if (depth >= maxDepth) {
    return Array.isArray(value) ? `array[${value.length}]` : 'object';
  }

  if (Array.isArray(value)) {
    const limited = value
      .slice(0, maxItems)
      .map((item) => boundValue(item, maxItems, maxDepth, depth + 1));

    if (value.length > maxItems) {
      limited.push(`... (${value.length - maxItems} more items)`);
    }

    return limited;
  }

  const entries = Object.entries(value);
  const output: Record<string, unknown> = {};

  for (const [key, child] of entries.slice(0, maxItems)) {
    output[key] = boundValue(child, maxItems, maxDepth, depth + 1);
  }

  if (entries.length > maxItems) {
    output['...'] = `(${entries.length - maxItems} more keys)`;
  }

  return output;
};

export const extractJsonPath = ({
  data,
  path,
  maxItems,
  maxDepth,
}: {
  data: unknown;
  path: string;
  maxItems: number;
  maxDepth: number;
}): unknown => {
  const accessors = parseJsonPath(path);
  const resolved = resolveAccessors(data, accessors);

  return boundValue(resolved, maxItems, maxDepth);
};
