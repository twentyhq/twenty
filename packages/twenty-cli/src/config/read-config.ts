import { readFile } from 'node:fs/promises';

import { isNumber } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { normalizeConfig } from '@/config/normalize-config';
import { type ConfigFile } from '@/config/types/config-file.type';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { hasErrorCode } from '@/utils/has-error-code';

const EMPTY_CONFIG: ConfigFile = { version: 1, remotes: {} };

const createInvalidConfigError = (configPath: string, reason: string) =>
  new CliError({
    code: 'INVALID_CONFIG',
    exitCode: EXIT_CODE.USAGE,
    message: `${configPath} is not a valid Twenty config: ${reason}`,
    hint: 'Fix or move the file. It is never overwritten while it is invalid.',
    details: { configPath },
  });

const JSON_ERROR_LOCATION_PATTERN = /line (\d+) column (\d+)/;

const describeJsonSyntaxError = (error: unknown) => {
  const location =
    error instanceof Error
      ? JSON_ERROR_LOCATION_PATTERN.exec(error.message)
      : null;

  return isDefined(location)
    ? `invalid JSON at line ${location[1]}, column ${location[2]}.`
    : 'invalid JSON.';
};

const readConfigText = async (configPath: string) => {
  try {
    return await readFile(configPath, 'utf8');
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) {
      return '';
    }

    throw new CliError({
      code: 'INVALID_CONFIG',
      exitCode: EXIT_CODE.USAGE,
      message: `Could not read ${configPath}.`,
      details: {
        configPath,
        reason: error instanceof Error ? error.message : String(error),
      },
    });
  }
};

export const readConfig = async (configPath: string): Promise<ConfigFile> => {
  const text = await readConfigText(configPath);

  if (text.trim() === '') {
    return EMPTY_CONFIG;
  }

  let raw: unknown;

  try {
    raw = JSON.parse(text);
  } catch (error) {
    throw createInvalidConfigError(configPath, describeJsonSyntaxError(error));
  }

  if (isPlainObject(raw) && isDefined(raw.version) && raw.version !== 1) {
    throw createInvalidConfigError(
      configPath,
      `version ${isNumber(raw.version) ? raw.version : 'unknown'} is not supported by this CLI.`,
    );
  }

  const config = normalizeConfig(raw);

  if (!isDefined(config)) {
    throw createInvalidConfigError(
      configPath,
      'remotes need an apiUrl and defaultRemote must be a name.',
    );
  }

  return config;
};
