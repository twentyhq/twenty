import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

export type LinkedinCounterpartResolver = (
  user: UnipileUser,
) => Promise<UnipileUser>;
