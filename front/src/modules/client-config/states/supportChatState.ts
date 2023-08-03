import { atom } from 'recoil';

import { SupportChat } from '~/generated/graphql';

export const supportChatState = atom<SupportChat>({
  key: 'supportChatState',
  default: {
    supportDriver: 'front',
    supportFrontendKey: null,
    supportHMACKey: null,
  },
});
