import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const resizeFieldOffsetComponentState = createComponentState<number>({
  key: 'resizeFieldOffsetComponentState',
  defaultValue: 0,
});
