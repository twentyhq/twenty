import { isDefined } from 'twenty-shared/utils';

export const getValidationRulePreviewValue = (
  record: Record<string, unknown>,
  path: string,
): unknown =>
  path
    .split('.')
    .reduce<unknown>(
      (value, segment) =>
        isDefined(value) && typeof value === 'object'
          ? (value as Record<string, unknown>)[segment]
          : undefined,
      record,
    );
