import { isPlainObject } from 'twenty-shared/utils';

export const getValidationRulePreviewValue = (
  record: Record<string, unknown>,
  path: string,
): unknown =>
  path
    .split('.')
    .reduce<unknown>(
      (value, segment) => (isPlainObject(value) ? value[segment] : undefined),
      record,
    );
