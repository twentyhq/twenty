import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { PROXY_HEADER_ENVIRONMENT_VARIABLE } from '@/proxy-headers/constants/proxy-header-environment-variable.constant';
import { createProxyHeaders } from '@/proxy-headers/create-proxy-headers';
import { parseProxyHeaderLinesOrThrow } from '@/proxy-headers/parse-proxy-header-lines-or-throw';
import { type ProxyHeaderSettings } from '@/proxy-headers/types/proxy-header-settings.type';

// Environment headers override saved ones by name; an environment command replaces the saved one.
export const resolveProxyHeaders = ({
  environment,
  savedSettings = { headers: {} },
}: {
  environment: NodeJS.ProcessEnv;
  savedSettings?: ProxyHeaderSettings;
}) => {
  const environmentHeaders = parseProxyHeaderLinesOrThrow({
    lines: (environment[PROXY_HEADER_ENVIRONMENT_VARIABLE.HEADERS] ?? '').split(
      /\r?\n/,
    ),
    sourceName: PROXY_HEADER_ENVIRONMENT_VARIABLE.HEADERS,
  });
  const environmentCommand =
    environment[PROXY_HEADER_ENVIRONMENT_VARIABLE.HEADER_COMMAND]?.trim();
  const headerCommand = isNonEmptyString(environmentCommand)
    ? environmentCommand
    : savedSettings.headerCommand;

  return createProxyHeaders({
    headers: { ...savedSettings.headers, ...environmentHeaders },
    ...(isDefined(headerCommand) ? { headerCommand } : {}),
  });
};
