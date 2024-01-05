import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const onEntityCountChangeScopedState = createStateScopeMap<
  ((entityCount: number) => void) | undefined
>({
  key: 'onEntityCountChangeScopedState',
  defaultValue: undefined,
});
