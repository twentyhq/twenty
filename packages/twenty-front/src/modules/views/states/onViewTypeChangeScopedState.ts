import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewType } from '@/views/types/ViewType';

export const onViewTypeChangeScopedState = createComponentState<
  ((viewType: ViewType) => void | Promise<void>) | undefined
>({
  key: 'onViewTypeChangeScopedState',
  defaultValue: undefined,
});
