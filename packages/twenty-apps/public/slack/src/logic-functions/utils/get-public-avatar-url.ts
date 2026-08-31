import { isDefined } from 'twenty-sdk/utils';

import { asNonEmptyString } from 'src/logic-functions/utils/as-non-empty-string';

export const getPublicAvatarUrl = ({
  avatarUrl,
  workspaceBaseUrl,
}: {
  avatarUrl: unknown;
  workspaceBaseUrl: string;
}): string | undefined => {
  const url = asNonEmptyString(avatarUrl);

  if (!isDefined(url) || !/^https?:\/\//.test(url)) {
    return undefined;
  }

  return url.startsWith(workspaceBaseUrl) ? undefined : url;
};
