import { Support } from '~/generated/graphql';
import { createState } from 'twenty-ui/utilities';

export const supportChatState = createState<Support>({
  key: 'supportChatState',
  defaultValue: {
    supportDriver: 'none',
    supportFrontChatId: null,
  },
});
