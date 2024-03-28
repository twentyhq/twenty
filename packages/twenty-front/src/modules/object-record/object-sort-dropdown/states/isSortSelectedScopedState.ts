import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isSortSelectedComponentState = createComponentState<boolean>({
  key: 'isSortSelectedComponentState',
  defaultValue: false,
});
