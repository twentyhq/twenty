import { isDefined } from 'twenty-shared/utils';

import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { type ParsedMediaQueryConditionParts } from '@/polyfills/media-query/types/ParsedMediaQueryConditionParts';
import { isParenthesizedCssBlock } from '@/polyfills/media-query/utils/isParenthesizedCssBlock';
import { parseMediaQueryCondition } from '@/polyfills/media-query/utils/parseMediaQueryCondition';

export const parseMediaQueryConditionParts = (
  conditionParts: string[],
): ParsedMediaQueryConditionParts | null => {
  const knownConditions: ParsedMediaQueryCondition[] = [];

  let hasUnknownCondition = false;

  for (const conditionPart of conditionParts) {
    if (!isParenthesizedCssBlock(conditionPart)) {
      return null;
    }

    const parsedConditions = parseMediaQueryCondition(conditionPart);

    if (!isDefined(parsedConditions)) {
      hasUnknownCondition = true;
      continue;
    }

    knownConditions.push(...parsedConditions);
  }

  return { knownConditions, hasUnknownCondition };
};
