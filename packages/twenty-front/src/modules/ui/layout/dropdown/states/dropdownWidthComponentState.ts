import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const dropdownWidthComponentState = createComponentState<
  number | undefined
>({
  key: 'dropdownWidthComponentState',
  defaultValue: 200,
});
