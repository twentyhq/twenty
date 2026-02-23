import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import { type Support, SupportDriver } from '~/generated-metadata/graphql';

export const supportChatState = createStateV2<Support>({
  key: 'supportChatState',
  defaultValue: {
    supportDriver: SupportDriver.NONE,
    supportFrontChatId: null,
  },
});
