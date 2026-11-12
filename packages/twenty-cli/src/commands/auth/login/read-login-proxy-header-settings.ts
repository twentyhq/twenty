import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import {
  readStringArrayOption,
  readStringOption,
} from '@/catalog/read-command-values';
import { type RemoteEntry } from '@/config/types/config-file.type';
import { parseProxyHeaderLines } from '@/proxy-headers/parse-proxy-header-lines';
import { readSavedProxyHeaderSettings } from '@/proxy-headers/read-saved-proxy-header-settings';
import { type ProxyHeaderSettings } from '@/proxy-headers/types/proxy-header-settings.type';
import { parseApiUrl } from '@/target/parse-api-url';

// Saved headers are dropped when a remote moves to another server, so one
// proxy's credentials are never sent to a different host.
export const readLoginProxyHeaderSettings = ({
  options,
  existingRemote,
  remoteName,
  apiUrl,
}: {
  options: Record<string, unknown>;
  existingRemote: RemoteEntry | undefined;
  remoteName: string;
  apiUrl: string;
}): ProxyHeaderSettings => {
  const headerOption = readStringArrayOption(options, 'proxyHeader');
  const commandOption = readStringOption(options, 'proxyHeaderCommand');
  const savedSettings =
    isDefined(existingRemote) &&
    (!isDefined(headerOption) || !isDefined(commandOption)) &&
    parseApiUrl({ rawUrl: existingRemote.apiUrl, sourceName: remoteName }) ===
      apiUrl
      ? readSavedProxyHeaderSettings({ remote: existingRemote, remoteName })
      : { headers: {} };
  const headers = isDefined(headerOption)
    ? parseProxyHeaderLines({
        lines: headerOption,
        sourceName: '--proxy-header',
      })
    : savedSettings.headers;
  const headerCommand = isDefined(commandOption)
    ? commandOption.trim()
    : savedSettings.headerCommand;

  return {
    headers,
    ...(isNonEmptyString(headerCommand) ? { headerCommand } : {}),
  };
};
