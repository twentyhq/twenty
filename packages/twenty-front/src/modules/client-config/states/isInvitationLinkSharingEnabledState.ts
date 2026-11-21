import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isInvitationLinkSharingEnabledState = createAtomState<boolean>({
  key: 'isInvitationLinkSharingEnabled',
  defaultValue: false,
});
