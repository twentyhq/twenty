import { createFamilyState, HotkeyScope } from 'twenty-ui';

export const customEditHotkeyScopeForFieldScopedState = createFamilyState<
  HotkeyScope | null,
  string
>({
  key: 'customEditHotkeyScopeForFieldScopedState',
  defaultValue: null,
});
