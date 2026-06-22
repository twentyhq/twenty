import { isNull, isObject, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const MAX_SKELETON_DEPTH = 4;
const KEY_COLLAPSE_THRESHOLD = 5;
const LEAF_STRING_BYTES_THRESHOLD = 128;
const SKELETON_HARD_CAP_BYTES = 1024;

const formatBytes = (bytes: number): string =>
  bytes >= 1024 ? `${(bytes / 1024).toFixed(1)} kB` : `${bytes} B`;

const scalarShape = (value: unknown): string => {
  if (isNull(value)) {
    return 'null';
  }

  if (isString(value)) {
    const byteLength = Buffer.byteLength(value);

    return byteLength > LEAF_STRING_BYTES_THRESHOLD
      ? `string (${formatBytes(byteLength)})`
      : 'string';
  }

  return typeof value;
};

const shapeSignature = (value: unknown): string => {
  if (Array.isArray(value)) {
    return 'array';
  }

  if (isDefined(value) && isObject(value)) {
    return `object:${Object.keys(value as Record<string, unknown>)
      .sort()
      .join(',')}`;
  }

  return scalarShape(value);
};

const buildShape = (
  value: unknown,
  depth: number,
  maxDepth: number,
): unknown => {
  if (!isDefined(value) || !isObject(value)) {
    return scalarShape(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'array[0]';
    }

    const firstElementShape = buildShape(value[0], depth + 1, maxDepth);

    if (isString(firstElementShape)) {
      return `array[${value.length}] of ${firstElementShape}`;
    }

    return { length: value.length, '[*]': firstElementShape };
  }

  if (depth >= maxDepth) {
    return 'object';
  }

  const entries = Object.entries(value as Record<string, unknown>);

  if (entries.length > KEY_COLLAPSE_THRESHOLD) {
    const signatures = new Set(entries.map(([, val]) => shapeSignature(val)));

    if (signatures.size === 1) {
      const [representativeKey, representativeValue] = entries[0];

      return {
        [representativeKey]: buildShape(
          representativeValue,
          depth + 1,
          maxDepth,
        ),
        [`... (${entries.length - 1} more keys)`]: '...',
      };
    }
  }

  const result: Record<string, unknown> = {};

  for (const [key, val] of entries) {
    result[key] = buildShape(val, depth + 1, maxDepth);
  }

  return result;
};

export const jsonShapeSkeleton = (value: unknown): unknown => {
  let maxDepth = MAX_SKELETON_DEPTH;
  let skeleton = buildShape(value, 0, maxDepth);

  while (
    maxDepth > 1 &&
    Buffer.byteLength(JSON.stringify(skeleton) ?? '') > SKELETON_HARD_CAP_BYTES
  ) {
    maxDepth -= 1;
    skeleton = buildShape(value, 0, maxDepth);
  }

  return skeleton;
};
