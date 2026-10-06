import { type ModifierKeyState } from '@/polyfills/events/types/ModifierKeyState';

export const MODIFIER_KEY_STATE_PROPERTY_NAME_BY_KEY_ARGUMENT: ReadonlyMap<
  string,
  keyof ModifierKeyState
> = new Map<string, keyof ModifierKeyState>([
  ['Alt', 'altKey'],
  ['Control', 'ctrlKey'],
  ['Meta', 'metaKey'],
  ['Shift', 'shiftKey'],
]);
