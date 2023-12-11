import { atom } from 'recoil';

import { Support } from '~/generated/graphql';

export const supportChatState = atom<Support>({
  key: 'supportChatState',
  default: {
    supportDriver: 'none',
    supportFrontChatId: null,
  },
});
