import { isDefined } from 'twenty-sdk/utils';

import { asNonEmptyString } from 'src/logic-functions/utils/as-non-empty-string';

// Only avatars that are already public absolute URLs render in Slack:
// instance-hosted files sit behind signed, often unreachable, URLs that
// Slack cannot fetch.
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
