import { isNonEmptyString, isObject } from '@sniptt/guards';

import { type TwentyPersonRecord } from 'src/logic-functions/types/twenty-person.type';

// The generated core client types its query result as `any`, so this guard is
// where the person shape starts being guaranteed. Every leaf below `id` is
// already treated as optional by the mappers.
export const isTwentyPersonRecord = (
  node: unknown,
): node is TwentyPersonRecord =>
  isObject<TwentyPersonRecord, unknown>(node) && isNonEmptyString(node.id);
