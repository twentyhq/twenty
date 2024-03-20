import { createComponentState } from 'twenty-ui';

import { GraphQLView } from '@/views/types/GraphQLView';

export const onCurrentViewChangeComponentState = createComponentState<
  ((view: GraphQLView | undefined) => void | Promise<void>) | undefined
>({
  key: 'onCurrentViewChangeComponentState',
  defaultValue: undefined,
});
