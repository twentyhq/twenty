import { createState } from 'twenty-ui';

import { Support } from '~/generated/graphql';

export const supportChatState = createState<Support>({
  key: 'supportChatState',
  defaultValue: {
    supportDriver: 'none',
    supportFrontChatId: null,
  },
});
