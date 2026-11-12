import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { RESERVED_PROXY_HEADER_NAMES } from '@/proxy-headers/constants/reserved-proxy-header-names.constant';

const HEADER_NAME_PATTERN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

const INVALID_HEADER_VALUE_PATTERN = /[\r\n\0]/;

const createInvalidHeaderError = (sourceName: string, reason: string) =>
  new CliError({
    code: 'INVALID_INPUT',
    exitCode: EXIT_CODE.USAGE,
    message: `${sourceName} has an invalid proxy header: ${reason}`,
    hint: 'Write each header as "Name: value", for example "cf-access-token: <token>".',
  });

export const validateProxyHeader = ({
  name,
  value,
  sourceName,
}: {
  name: string;
  value: string;
  sourceName: string;
}): [string, string] => {
  const normalizedName = name.trim().toLowerCase();
  const normalizedValue = value.trim();

  if (!HEADER_NAME_PATTERN.test(normalizedName)) {
    throw createInvalidHeaderError(
      sourceName,
      `"${name.trim()}" is not a valid header name.`,
    );
  }

  if (RESERVED_PROXY_HEADER_NAMES.has(normalizedName)) {
    throw createInvalidHeaderError(
      sourceName,
      `${normalizedName} is set by the CLI and cannot be overridden.`,
    );
  }

  if (INVALID_HEADER_VALUE_PATTERN.test(normalizedValue)) {
    throw createInvalidHeaderError(
      sourceName,
      `the value of ${normalizedName} contains a line break.`,
    );
  }

  return [normalizedName, normalizedValue];
};
