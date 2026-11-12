import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type RemoteEntry } from '@/config/types/config-file.type';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { type ProxyHeaderSettings } from '@/proxy-headers/types/proxy-header-settings.type';
import { validateProxyHeaderOrThrow } from '@/proxy-headers/validate-proxy-header-or-throw';

const createInvalidSettingError = ({
  remoteName,
  field,
}: {
  remoteName: string;
  field: 'proxyHeaders' | 'proxyHeaderCommand';
}) =>
  new CliError({
    code: 'INVALID_CONFIG',
    exitCode: EXIT_CODE.USAGE,
    message: `Remote ${remoteName} has an invalid ${field} in the Twenty config.`,
    hint:
      field === 'proxyHeaders'
        ? 'It must be an object of header names to string values.'
        : 'It must be a non-empty string.',
    details: { remote: remoteName, field },
  });

export const readSavedProxyHeaderSettings = ({
  remote,
  remoteName,
}: {
  remote: RemoteEntry;
  remoteName: string;
}): ProxyHeaderSettings => {
  const { proxyHeaders = {}, proxyHeaderCommand } = remote;

  if (!isPlainObject(proxyHeaders)) {
    throw createInvalidSettingError({ remoteName, field: 'proxyHeaders' });
  }

  if (isDefined(proxyHeaderCommand) && !isNonEmptyString(proxyHeaderCommand)) {
    throw createInvalidSettingError({
      remoteName,
      field: 'proxyHeaderCommand',
    });
  }

  const headers = Object.fromEntries(
    Object.entries(proxyHeaders).map(([name, value]) => {
      if (!isString(value)) {
        throw createInvalidSettingError({ remoteName, field: 'proxyHeaders' });
      }

      return validateProxyHeaderOrThrow({
        name,
        value,
        sourceName: `Remote ${remoteName}`,
      });
    }),
  );

  return {
    headers,
    ...(isDefined(proxyHeaderCommand)
      ? { headerCommand: proxyHeaderCommand }
      : {}),
  };
};
