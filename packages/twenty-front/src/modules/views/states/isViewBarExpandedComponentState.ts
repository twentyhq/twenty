import { createComponentState } from 'twenty-ui';

export const isViewBarExpandedComponentState = createComponentState<boolean>({
  key: 'isViewBarExpandedComponentState',
  defaultValue: true,
});
