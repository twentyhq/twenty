import { isDefined } from 'twenty-shared/utils';

import { type PublicTarget } from '@/target/types/public-target.type';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';

export const toPublicTarget = ({
  apiUrl,
  source,
  remoteName,
}: ResolvedTarget): PublicTarget => ({
  ...(isDefined(remoteName) ? { remote: remoteName } : {}),
  apiUrl,
  source,
});
