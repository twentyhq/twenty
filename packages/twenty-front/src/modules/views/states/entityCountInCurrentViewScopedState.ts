import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const entityCountInCurrentViewScopedState = createComponentState<number>(
  {
    key: 'entityCountInCurrentViewScopedState',
    defaultValue: 0,
  },
);
