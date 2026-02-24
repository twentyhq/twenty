import { createState } from '@/ui/utilities/state/jotai/utils/createState';
import { type Support, SupportDriver } from '~/generated-metadata/graphql';

export const supportChatState = createState<Support>({
  key: 'supportChatState',
  defaultValue: {
    supportDriver: SupportDriver.NONE,
    supportFrontChatId: null,
  },
});
