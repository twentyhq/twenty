import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const entityCountInCurrentViewScopedState = createScopedState<number>({
  key: 'entityCountInCurrentViewScopedState',
  defaultValue: 0,
});
