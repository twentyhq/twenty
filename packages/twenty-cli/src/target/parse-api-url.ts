import { isDefined } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { API_URL_PROTOCOLS } from '@/target/constants/api-url-protocols.constant';
import { formatApiUrl } from '@/target/format-api-url';

export const parseApiUrl = ({
  rawUrl,
  sourceName,
}: {
  rawUrl: string;
  sourceName: string;
}) => {
  const url = URL.parse(rawUrl.trim());

  const isValid =
    isDefined(url) &&
    API_URL_PROTOCOLS.includes(url.protocol) &&
    url.username === '' &&
    url.password === '' &&
    url.search === '' &&
    url.hash === '';

  if (!isValid) {
    throw new CliError({
      code: 'INVALID_API_URL',
      exitCode: EXIT_CODE.USAGE,
      message: `${sourceName} must be an http or https URL without credentials, query or fragment.`,
      hint: 'For example: https://acme.twenty.com',
    });
  }

  return formatApiUrl(url);
};
