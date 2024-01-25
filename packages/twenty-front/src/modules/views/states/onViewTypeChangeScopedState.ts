import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';
import { ViewType } from '@/views/types/ViewType';

export const onViewTypeChangeScopedState = createStateScopeMap<
  ((viewType: ViewType) => void | Promise<void>) | undefined
>({
  key: 'onViewTypeChangeScopedState',
  defaultValue: undefined,
});
