import { HotkeyScope } from '../types/HotkeyScope';

export function isSameHotkeyScope(
  hotkeyScope1: HotkeyScope | undefined | null,
  hotkeyScope2: HotkeyScope | undefined | null,
): boolean {
  return JSON.stringify(hotkeyScope1) === JSON.stringify(hotkeyScope2);
}
