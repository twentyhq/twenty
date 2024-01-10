import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const onEntityCountChangeStateScopeMap = createStateScopeMap<
  ((entityCount: number) => void) | undefined
>({
  key: 'onEntityCountChangeStateScopeMap',
  defaultValue: undefined,
});
