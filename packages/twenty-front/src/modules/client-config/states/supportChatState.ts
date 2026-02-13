import { createState } from '@/ui/utilities/state/utils/createState';
import { type Support, SupportDriver } from '~/generated-metadata/graphql';

export const supportChatState = createState<Support>({
  key: 'supportChatState',
  defaultValue: {
    supportDriver: SupportDriver.NONE,
    supportFrontChatId: null,
  },
});
