import { isDefined } from 'twenty-shared/utils';

import { type ConfigFile } from '@/config/types/config-file.type';
import { parseApiUrl } from '@/target/parse-api-url';

export const getMismatchedRemoteUrl = ({
  config,
  remoteName,
  apiUrl,
}: {
  config: ConfigFile;
  remoteName: string;
  apiUrl: string;
}) => {
  const remote = Object.hasOwn(config.remotes, remoteName)
    ? config.remotes[remoteName]
    : undefined;

  if (
    !isDefined(remote) ||
    parseApiUrl({ rawUrl: remote.apiUrl, sourceName: remoteName }) === apiUrl
  ) {
    return undefined;
  }

  return remote.apiUrl;
};
