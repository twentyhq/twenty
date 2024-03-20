import { createComponentState } from 'twenty-ui';

export const entityCountInCurrentViewComponentState =
  createComponentState<number>({
    key: 'entityCountInCurrentViewComponentState',
    defaultValue: 0,
  });
