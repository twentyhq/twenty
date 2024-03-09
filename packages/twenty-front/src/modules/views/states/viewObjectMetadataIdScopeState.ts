import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const viewObjectMetadataIdScopeState = createComponentState<
  string | undefined
>({
  key: 'viewObjectMetadataIdScopeState',
  defaultValue: undefined,
});
