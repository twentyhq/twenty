import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const onEntityCountChangeScopedState = createScopedState<
  ((entityCount: number) => void) | undefined
>({
  key: 'onEntityCountChangeScopedState',
  defaultValue: undefined,
});
