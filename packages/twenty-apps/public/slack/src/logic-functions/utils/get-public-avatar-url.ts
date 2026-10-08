import { isDefined } from 'twenty-sdk/utils';

import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';

export const getPublicAvatarUrl = ({
  avatarUrl,
  workspaceBaseUrls,
}: {
  avatarUrl: unknown;
  workspaceBaseUrls: string[];
}): string | undefined => {
  const url = readOptionalString(avatarUrl);

  if (!isDefined(url) || !/^https?:\/\//i.test(url)) {
    return undefined;
  }

  return workspaceBaseUrls.some((baseUrl) => url.startsWith(baseUrl))
    ? undefined
    : url;
};
