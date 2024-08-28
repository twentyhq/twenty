import { ApolloError } from '@apollo/client';
import { createState } from 'twenty-ui';

export const showPageWorkflowErrorState = createState<ApolloError | undefined>({
  key: 'showPageWorkflowErrorState',
  defaultValue: undefined,
});
