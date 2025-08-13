import { createState } from 'twenty-ui/utilities';
import { type CoreView } from '~/generated-metadata/graphql';

export const coreViewsState = createState<CoreView[]>({
  key: 'coreViewsState',
  defaultValue: [],
});
