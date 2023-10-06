import { atomFamily } from 'recoil';

import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

export const createScopedState = <T>({
  key,
  defaultValue,
}: {
  key: string;
  defaultValue: T;
}) => {
  return atomFamily<T, { scopeId: string }>({
    key,
    default: defaultValue,
  });
};

export const dropdownHotkeyScopeScopedState = createScopedState<
  HotkeyScope | null | undefined
>({
  key: 'dropdownHotkeyScopeScopedState',
  defaultValue: null,
});
