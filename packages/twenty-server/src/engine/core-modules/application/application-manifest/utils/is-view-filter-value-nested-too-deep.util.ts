import { isDefined } from 'twenty-shared/utils';

export const MAX_VIEW_FILTER_VALUE_DEPTH = 8;

export const isViewFilterValueNestedTooDeep = (value: unknown): boolean => {
  const pending = [{ value, depth: 0 }];

  for (let next = pending.pop(); isDefined(next); next = pending.pop()) {
    if (!isDefined(next.value) || typeof next.value !== 'object') {
      continue;
    }

    if (next.depth >= MAX_VIEW_FILTER_VALUE_DEPTH) {
      return true;
    }

    for (const child of Object.values(next.value)) {
      pending.push({ value: child, depth: next.depth + 1 });
    }
  }

  return false;
};
