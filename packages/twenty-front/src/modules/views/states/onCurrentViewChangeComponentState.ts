import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { View } from '@/views/types/View';

export const onCurrentViewChangeComponentState = createComponentState<
  ((view: View | undefined) => void | Promise<void>) | undefined
>({
  key: 'onCurrentViewChangeComponentState',
  defaultValue: undefined,
});
