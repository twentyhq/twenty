import { isNonEmptyString, isObject } from '@sniptt/guards';

import { type TwentyPersonRecord } from 'src/logic-functions/types/twenty-person.type';

export const isTwentyPersonRecord = (
  node: unknown,
): node is TwentyPersonRecord =>
  isObject<TwentyPersonRecord, unknown>(node) && isNonEmptyString(node.id);
