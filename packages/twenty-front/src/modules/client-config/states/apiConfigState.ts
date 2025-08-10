import { type ApiConfig } from '~/generated/graphql';
import { createState } from 'twenty-ui/utilities';

export const apiConfigState = createState<ApiConfig | null>({
  key: 'apiConfigState',
  defaultValue: null,
});
