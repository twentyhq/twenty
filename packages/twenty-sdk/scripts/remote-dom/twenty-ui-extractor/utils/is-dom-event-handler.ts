import { type Type } from 'ts-morph';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

const DOM_EVENT_TYPE_NAMES = new Set([
  'Event',
  'UIEvent',
  'MouseEvent',
  'KeyboardEvent',
  'FocusEvent',
  'ChangeEvent',
  'FormEvent',
  'DragEvent',
  'WheelEvent',
  'ClipboardEvent',
  'TouchEvent',
  'PointerEvent',
  'AnimationEvent',
  'TransitionEvent',
  'SyntheticEvent',
  'BaseSyntheticEvent',
]);

const isEventType = (type: Type): boolean => {
  const symbol = type.getSymbol() ?? type.getAliasSymbol();

  if (isDefined(symbol) && DOM_EVENT_TYPE_NAMES.has(symbol.getName())) {
    return true;
  }

  return type.getBaseTypes().some(isEventType);
};

export const isDomEventHandler = (propertyType: Type): boolean => {
  const nonNullableType = propertyType.getNonNullableType();

  const callSignatures = nonNullableType.getCallSignatures();

  if (!isNonEmptyArray(callSignatures)) {
    return false;
  }

  return callSignatures.some((signature) => {
    const firstParam = signature.getParameters()[0];

    if (!isDefined(firstParam)) {
      return false;
    }

    const paramType = firstParam.getValueDeclaration()?.getType();

    if (!isDefined(paramType)) {
      return false;
    }

    return isEventType(paramType);
  });
};
