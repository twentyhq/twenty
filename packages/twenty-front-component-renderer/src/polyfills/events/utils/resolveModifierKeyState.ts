import { isDefined } from 'twenty-shared/utils';

import { MODIFIER_KEY_STATE_PROPERTY_NAME_BY_KEY_ARGUMENT } from '@/polyfills/events/constants/ModifierKeyStatePropertyNameByKeyArgument';
import { type ModifierKeyState } from '@/polyfills/events/types/ModifierKeyState';

export const resolveModifierKeyState = (
  modifierKeyState: ModifierKeyState,
  keyArgument: string,
): boolean => {
  const propertyName =
    MODIFIER_KEY_STATE_PROPERTY_NAME_BY_KEY_ARGUMENT.get(keyArgument);

  return isDefined(propertyName) && modifierKeyState[propertyName];
};
