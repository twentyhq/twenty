import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type Support, SupportDriver } from '~/generated-metadata/graphql';

export const supportChatState = createAtomState<Support>({
  key: 'supportChatState',
  defaultValue: {
    supportDriver: SupportDriver.NONE,
    supportFrontChatId: null,
  },
});
