import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const entityCountInCurrentViewComponentState =
  createComponentState<number>({
    key: 'entityCountInCurrentViewComponentState',
    defaultValue: 0,
  });
