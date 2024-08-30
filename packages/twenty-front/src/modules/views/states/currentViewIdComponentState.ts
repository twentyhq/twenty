import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewScopeInternalContext } from '@/views/scopes/scope-internal-context/ViewScopeInternalContext';

export const currentViewIdComponentState = createComponentStateV2<
  string | undefined
>({
  key: 'currentViewIdComponentState',
  defaultValue: undefined,
  componentContext: ViewScopeInternalContext,
});
