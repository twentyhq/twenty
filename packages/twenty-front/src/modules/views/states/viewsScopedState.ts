import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { GraphQLView } from '@/views/types/GraphQLView';

export const viewsScopedState = createComponentState<GraphQLView[]>({
  key: 'viewsScopedState',
  defaultValue: [],
});
