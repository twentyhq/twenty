import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const onEntityCountChangeComponentState = createComponentState<
  ((entityCount: number | undefined) => void) | undefined
>({
  key: 'onEntityCountChangeComponentState',
  defaultValue: undefined,
});
