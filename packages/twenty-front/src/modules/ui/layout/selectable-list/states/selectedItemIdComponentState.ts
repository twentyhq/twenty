import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const selectedItemIdComponentState = createComponentState<string | null>(
  {
    key: 'selectedItemIdComponentState',
    defaultValue: null,
  },
);
