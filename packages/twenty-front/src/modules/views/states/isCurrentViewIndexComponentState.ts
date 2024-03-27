import { createComponentState } from 'twenty-ui';

export const isCurrentViewKeyIndexComponentState =
  createComponentState<boolean>({
    key: 'isCurrentViewKeyIndexComponentState',
    defaultValue: true,
  });
