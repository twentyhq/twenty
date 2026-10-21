import { CONDITIONAL_DISPLAY_CONTEXT_KEYS } from 'twenty-shared/constants';
import {
  type ConditionalDisplayContextKey,
  type ConditionalDisplaySurface,
} from 'twenty-shared/types';

export const getConditionalDisplayContextKeysForSurface = (
  surface: ConditionalDisplaySurface,
): ConditionalDisplayContextKey[] =>
  (
    Object.keys(
      CONDITIONAL_DISPLAY_CONTEXT_KEYS,
    ) as ConditionalDisplayContextKey[]
  ).filter((contextKey) =>
    CONDITIONAL_DISPLAY_CONTEXT_KEYS[contextKey].surfaces.includes(surface),
  );
