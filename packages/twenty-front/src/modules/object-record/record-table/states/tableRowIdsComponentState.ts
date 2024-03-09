import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const tableRowIdsComponentState = createComponentState<string[]>({
  key: 'tableRowIdsComponentState',
  defaultValue: [],
});
