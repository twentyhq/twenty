import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const tableLastRowVisibleComponentState = createComponentState<boolean>({
  key: 'tableLastRowVisibleComponentState',
  defaultValue: false,
});
