import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';
import { GraphQLView } from '@/views/types/GraphQLView';

export const viewsScopedState = createScopedState<GraphQLView[]>({
  key: 'viewsScopedState',
  defaultValue: [],
});
