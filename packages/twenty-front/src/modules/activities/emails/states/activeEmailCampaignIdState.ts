import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const activeEmailCampaignIdState = createAtomState<string | null>({
  key: 'activeEmailCampaignIdState',
  defaultValue: null,
});
