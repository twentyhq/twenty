import { createState } from 'twenty-ui/utilities';
import { Support, SupportDriver } from '~/generated/graphql';

export const supportChatState = createState<Support>({
  key: 'supportChatState',
  defaultValue: {
    supportDriver: SupportDriver.NONE,
    supportFrontChatId: null,
  },
});
