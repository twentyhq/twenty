import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

export const assertUrlWithinTarget = ({
  url,
  apiUrl,
  requestedPath,
}: {
  url: URL;
  apiUrl: string;
  requestedPath: string;
}) => {
  const baseUrl = new URL(`${apiUrl}/`);

  if (
    url.origin !== baseUrl.origin ||
    !url.pathname.startsWith(baseUrl.pathname)
  ) {
    throw new CliError({
      code: 'INVALID_REQUEST_PATH',
      exitCode: EXIT_CODE.USAGE,
      message: `${requestedPath} is outside ${apiUrl}.`,
      hint: 'Pass a path relative to the API URL, for example /rest/companies.',
      details: { path: requestedPath },
    });
  }
};
