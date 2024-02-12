import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const onViewCompactModeChangeScopeState = createStateScopeMap<
  ((isCompactModeActive: boolean) => void | Promise<void>) | undefined
>({
  key: 'onViewCompactModeChangeScopeState',
  defaultValue: undefined,
});
