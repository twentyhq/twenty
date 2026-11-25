import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import {
  readStringArrayOption,
  readStringOption,
} from '@/catalog/read-command-values';
import { type RemoteEntry } from '@/config/types/config-file.type';
import { parseProxyHeaderLinesOrThrow } from '@/proxy-headers/parse-proxy-header-lines-or-throw';
import { readSavedProxyHeaderSettingsOrThrow } from '@/proxy-headers/read-saved-proxy-header-settings-or-throw';
import { type ProxyHeaderSettings } from '@/proxy-headers/types/proxy-header-settings.type';
import { parseApiUrl } from '@/target/parse-api-url';

const isSavedForServer = ({
  savedApiUrl,
  remoteName,
  apiUrl,
}: {
  savedApiUrl: string;
  remoteName: string;
  apiUrl: string;
}) => {
  try {
    return (
      parseApiUrl({ rawUrl: savedApiUrl, sourceName: remoteName }) === apiUrl
    );
  } catch {
    // A malformed saved URL must not block --replace from fixing it.
    return false;
  }
};

const readSettingsSavedForServer = ({
  existingRemote,
  remoteName,
  apiUrl,
}: {
  existingRemote: RemoteEntry | undefined;
  remoteName: string;
  apiUrl: string;
}): ProxyHeaderSettings => {
  if (!isDefined(existingRemote)) {
    return { headers: {} };
  }

  // Never send one proxy's credentials to a remote's new server.
  if (
    !isSavedForServer({
      savedApiUrl: existingRemote.apiUrl,
      remoteName,
      apiUrl,
    })
  ) {
    return { headers: {} };
  }

  return readSavedProxyHeaderSettingsOrThrow({
    remote: existingRemote,
    remoteName,
  });
};

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
    isDefined(headerOption) && isDefined(commandOption)
      ? { headers: {} }
      : readSettingsSavedForServer({ existingRemote, remoteName, apiUrl });
  const headers = isDefined(headerOption)
    ? parseProxyHeaderLinesOrThrow({
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
