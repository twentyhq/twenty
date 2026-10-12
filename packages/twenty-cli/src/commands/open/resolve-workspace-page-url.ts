import { isDefined } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

export const resolveWorkspacePageUrl = ({
  workspaceUrl,
  page,
}: {
  workspaceUrl: URL;
  page: string | undefined;
}) => {
  if (!isDefined(page)) {
    return workspaceUrl.href;
  }

  const pageUrl = URL.parse(page, workspaceUrl);

  if (
    !isDefined(pageUrl) ||
    pageUrl.origin !== workspaceUrl.origin ||
    pageUrl.pathname.startsWith('//')
  ) {
    throw new CliError({
      code: 'USAGE',
      exitCode: EXIT_CODE.USAGE,
      message: `${page} is not a page of the workspace.`,
      hint: 'Pass a path inside the workspace, for example settings/applications.',
    });
  }

  return pageUrl.href;
};
