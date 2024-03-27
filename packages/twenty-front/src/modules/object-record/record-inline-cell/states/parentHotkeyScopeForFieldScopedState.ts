import { createFamilyState, HotkeyScope } from 'twenty-ui';

export const parentHotkeyScopeForFieldScopedState = createFamilyState<
  HotkeyScope | null,
  string
>({
  key: 'parentHotkeyScopeForFieldScopedState',
  defaultValue: null,
});
