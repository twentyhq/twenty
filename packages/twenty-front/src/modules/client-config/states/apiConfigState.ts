import { createState } from "twenty-shared";

import { ApiConfig } from '~/generated/graphql';

export const apiConfigState = createState<ApiConfig | null>({
  key: 'apiConfigState',
  defaultValue: null,
});
