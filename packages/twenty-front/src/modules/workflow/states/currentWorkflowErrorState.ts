import { ApolloError } from '@apollo/client';
import { createState } from 'twenty-ui';

export const currentWorkflowErrorState = createState<ApolloError | undefined>({
  key: 'currentWorkflowErrorState',
  defaultValue: undefined,
});
