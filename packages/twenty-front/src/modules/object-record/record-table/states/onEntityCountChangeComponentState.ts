import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const onEntityCountChangeComponentState = createComponentState<
  ((entityCount?: number) => void) | undefined
>({
  key: 'onEntityCountChangeComponentState',
  defaultValue: undefined,
});
