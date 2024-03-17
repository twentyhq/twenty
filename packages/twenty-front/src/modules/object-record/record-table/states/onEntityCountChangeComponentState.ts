import { createComponentState } from 'twenty-ui';

export const onEntityCountChangeComponentState = createComponentState<
  ((entityCount: number) => void) | undefined
>({
  key: 'onEntityCountChangeComponentState',
  defaultValue: undefined,
});
