import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const myConnectedAccountsState = createAtomState<
  Omit<ConnectedAccount, 'messageChannels' | 'calendarChannels'>[] | null
>({
  key: 'myConnectedAccountsState',
  defaultValue: null,
});
