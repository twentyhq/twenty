import { isDefined } from 'twenty-shared/utils';

type ModifierKeyState = {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
};

const MODIFIER_KEY_STATE_PROPERTY_NAME_BY_KEY_ARGUMENT = new Map<
  string,
  keyof ModifierKeyState
>([
  ['Alt', 'altKey'],
  ['Control', 'ctrlKey'],
  ['Meta', 'metaKey'],
  ['Shift', 'shiftKey'],
]);

export const resolveModifierKeyState = (
  modifierKeyState: ModifierKeyState,
  keyArgument: string,
): boolean => {
  const propertyName =
    MODIFIER_KEY_STATE_PROPERTY_NAME_BY_KEY_ARGUMENT.get(keyArgument);

  return isDefined(propertyName) && modifierKeyState[propertyName];
};
