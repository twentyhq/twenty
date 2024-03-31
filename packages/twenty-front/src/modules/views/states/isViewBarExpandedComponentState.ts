import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isViewBarExpandedComponentState = createComponentState<boolean>({
  key: 'isViewBarExpandedComponentState',
  defaultValue: true,
});
