import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const onViewCompactModeChangeScopeState = createComponentState<
  ((isCompactModeActive: boolean) => void | Promise<void>) | undefined
>({
  key: 'onViewCompactModeChangeScopeState',
  defaultValue: undefined,
});
