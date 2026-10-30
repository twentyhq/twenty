import { type UnipileAccountStatus } from 'src/unipile/types/unipile-account-status.type';
import { type UnipileProvider } from 'src/unipile/types/unipile-provider.type';

export type UnipileAccount = {
  object: 'Account';
  id: string;
  user_id: string;
  name?: string;
  created_at: string;
  status: UnipileAccountStatus;
  provider: UnipileProvider;
};
