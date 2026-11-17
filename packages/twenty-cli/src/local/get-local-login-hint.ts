import { isDefined } from 'twenty-shared/utils';

import { getConfigPath } from '@/config/get-config-path';
import { readConfig } from '@/config/read-config';
import { CliError } from '@/output/cli-error';
import { parseApiUrl } from '@/target/parse-api-url';

export const getLocalLoginHint = async ({
  apiUrl,
  remoteName,
}: {
  apiUrl: string;
  remoteName: string;
}) => {
  const command = `twenty auth login --url ${apiUrl} --name ${remoteName}`;

  try {
    const config = await readConfig(getConfigPath());
    const remote = config.remotes[remoteName];

    if (
      isDefined(remote) &&
      parseApiUrl({ rawUrl: remote.apiUrl, sourceName: remoteName }) !== apiUrl
    ) {
      return `Saved remote "${remoteName}" points to ${remote.apiUrl}.\nTo use this environment instead: ${command} --replace`;
    }
  } catch (error) {
    // Authentication config must not prevent local startup.
    if (
      !(error instanceof CliError) ||
      !['INVALID_CONFIG', 'INVALID_API_URL'].includes(error.code)
    ) {
      throw error;
    }
  }

  return `Sign in: ${command}`;
};
