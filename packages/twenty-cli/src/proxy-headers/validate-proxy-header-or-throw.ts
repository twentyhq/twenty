import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { RESERVED_PROXY_HEADER_NAMES } from '@/proxy-headers/constants/reserved-proxy-header-names.constant';

const HEADER_NAME_PATTERN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

// RFC 9110 field values: visible ASCII, space, tab and obs-text (0x80-0xFF).
const INVALID_HEADER_VALUE_PATTERN = /[^\t\x20-\x7E\x80-\xFF]/;

const createInvalidHeaderError = ({
  sourceName,
  reason,
}: {
  sourceName: string;
  reason: string;
}) =>
  new CliError({
    code: 'INVALID_INPUT',
    exitCode: EXIT_CODE.USAGE,
    message: `${sourceName} has an invalid proxy header: ${reason}`,
    hint: 'Write each header as "Name: value", for example "cf-access-token: <token>".',
  });

export const validateProxyHeaderOrThrow = ({
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
    // The rejected text may come from command output, so it is never quoted.
    throw createInvalidHeaderError({
      sourceName,
      reason:
        'a header name contains a character HTTP header names cannot carry.',
    });
  }

  if (RESERVED_PROXY_HEADER_NAMES.has(normalizedName)) {
    throw createInvalidHeaderError({
      sourceName,
      reason: `${normalizedName} is set by the CLI and cannot be overridden.`,
    });
  }

  if (INVALID_HEADER_VALUE_PATTERN.test(normalizedValue)) {
    throw createInvalidHeaderError({
      sourceName,
      reason: `the value of ${normalizedName} contains a line break or a character HTTP headers cannot carry, such as a smart quote.`,
    });
  }

  return [normalizedName, normalizedValue];
};
