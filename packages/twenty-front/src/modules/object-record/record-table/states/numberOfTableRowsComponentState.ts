import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const numberOfTableRowsComponentState = createComponentState<
  number | undefined
>({
  key: 'numberOfTableRowsComponentState',
  defaultValue: undefined,
});
