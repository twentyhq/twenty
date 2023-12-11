import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const viewObjectMetadataIdScopeState = createScopedState<
  string | undefined
>({
  key: 'viewObjectMetadataIdScopeState',
  defaultValue: undefined,
});
