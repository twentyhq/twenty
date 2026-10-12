import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { assertUrlWithinTarget } from '@/transport/assert-url-within-target';

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+.-]*:/i;

export const resolveRequestUrl = ({
  apiUrl,
  path,
}: {
  apiUrl: string;
  path: string;
}) => {
  const trimmedPath = path.trim();

  if (
    ABSOLUTE_URL_PATTERN.test(trimmedPath) ||
    trimmedPath.startsWith('//') ||
    trimmedPath.includes('\\')
  ) {
    throw new CliError({
      code: 'INVALID_REQUEST_PATH',
      exitCode: EXIT_CODE.USAGE,
      message: `${path} is not a relative path.`,
      hint: 'Pass the path only, for example /rest/companies. Requests always go to the selected workspace.',
      details: { path },
    });
  }

  const url = new URL(trimmedPath.replace(/^\/+/, ''), `${apiUrl}/`);

  assertUrlWithinTarget({ url, apiUrl, requestedPath: path });

  return url;
};
