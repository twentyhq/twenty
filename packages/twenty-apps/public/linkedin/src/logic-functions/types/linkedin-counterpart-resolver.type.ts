import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

export type LinkedinCounterpartResolver = (input: {
  user: UnipileUser;
  shouldLookUp?: () => Promise<boolean>;
}) => Promise<UnipileUser>;
