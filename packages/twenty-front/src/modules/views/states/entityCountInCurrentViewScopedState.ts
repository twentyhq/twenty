import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const entityCountInCurrentViewScopedState = createStateScopeMap<number>({
  key: 'entityCountInCurrentViewScopedState',
  defaultValue: 0,
});
