import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const entityCountInCurrentViewComponentState = createComponentState<
  number | undefined
>({
  key: 'entityCountInCurrentViewComponentState',
  defaultValue: undefined,
});
