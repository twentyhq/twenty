import { isNull, isObject, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { formatBytes } from 'src/engine/core-modules/tool/utils/format-bytes.util';

const PREVIEW_MAX_DEPTH = 4;
const PREVIEW_MAX_ARRAY_ITEMS = 3;
const PREVIEW_LEAF_STRING_LENGTH = 200;
const KEY_COLLAPSE_THRESHOLD = 5;
const PREVIEW_HARD_CAP_BYTES = 2048;

const boundScalar = (value: unknown): unknown => {
  if (isString(value)) {
    const byteLength = Buffer.byteLength(value);

    if (value.length > PREVIEW_LEAF_STRING_LENGTH) {
      return `${value.slice(0, PREVIEW_LEAF_STRING_LENGTH)}… (truncated, ${formatBytes(byteLength)} total)`;
    }
  }

  return value;
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

  if (isNull(value)) {
    return 'null';
  }

  return typeof value;
};

const buildPreview = (
  value: unknown,
  maxDepth: number,
  depth: number,
): unknown => {
  if (isNull(value) || !isObject(value)) {
    return boundScalar(value);
  }

  if (depth >= maxDepth) {
    return Array.isArray(value) ? `array[${value.length}]` : 'object';
  }

  if (Array.isArray(value)) {
    const limited = value
      .slice(0, PREVIEW_MAX_ARRAY_ITEMS)
      .map((item) => buildPreview(item, maxDepth, depth + 1));

    if (value.length > PREVIEW_MAX_ARRAY_ITEMS) {
      limited.push(
        `... (${value.length - PREVIEW_MAX_ARRAY_ITEMS} more items)`,
      );
    }

    return limited;
  }

  const entries = Object.entries(value as Record<string, unknown>);

  if (entries.length > KEY_COLLAPSE_THRESHOLD) {
    const signatures = new Set(entries.map(([, val]) => shapeSignature(val)));

    if (signatures.size === 1) {
      const [representativeKey, representativeValue] = entries[0];

      return {
        [representativeKey]: buildPreview(
          representativeValue,
          maxDepth,
          depth + 1,
        ),
        [`... (${entries.length - 1} more keys)`]: '...',
      };
    }
  }

  const output: Record<string, unknown> = {};

  for (const [key, child] of entries) {
    output[key] = buildPreview(child, maxDepth, depth + 1);
  }

  return output;
};

export const jsonPreview = (value: unknown): unknown => {
  let maxDepth = PREVIEW_MAX_DEPTH;
  let preview = buildPreview(value, maxDepth, 0);

  while (
    maxDepth > 1 &&
    Buffer.byteLength(JSON.stringify(preview) ?? '') > PREVIEW_HARD_CAP_BYTES
  ) {
    maxDepth -= 1;
    preview = buildPreview(value, maxDepth, 0);
  }

  return preview;
};
