import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const activeTabIdComponentState = createComponentState<string | null>({
  key: 'activeTabIdComponentState',
  defaultValue: null,
});
