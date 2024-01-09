import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';
import { GraphQLView } from '@/views/types/GraphQLView';

export const viewsScopedState = createStateScopeMap<GraphQLView[]>({
  key: 'viewsScopedState',
  defaultValue: [],
});
