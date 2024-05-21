import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const numberOfTableRowsComponentState = createComponentState<number>({
  key: 'numberOfTableRowsComponentState',
  defaultValue: 0,
});
