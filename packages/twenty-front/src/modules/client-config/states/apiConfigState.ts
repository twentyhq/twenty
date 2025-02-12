import { createState } from '@ui/utilities/state/utils/createState';

import { ApiConfig } from '~/generated/graphql';

export const apiConfigState = createState<ApiConfig | null>({
  key: 'apiConfigState',
  defaultValue: null,
});
