import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const viewObjectMetadataIdScopeState = createStateScopeMap<
  string | undefined
>({
  key: 'viewObjectMetadataIdScopeState',
  defaultValue: undefined,
});
