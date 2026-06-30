import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { isDefined } from 'twenty-shared/utils';

export const buildApplicationLogoUrl = ({
  workspaceId,
  applicationId,
  logo,
}: {
  workspaceId?: string | null;
  applicationId?: string | null;
  logo?: string | null;
}): string | undefined => {
  if (
    !isDefined(logo) ||
    logo.startsWith('http://') ||
    logo.startsWith('https://')
  ) {
    return logo ?? undefined;
  }

  if (!isDefined(workspaceId) || !isDefined(applicationId)) {
    return undefined;
  }

  return `${REACT_APP_SERVER_BASE_URL}/public-assets/${workspaceId}/${applicationId}/${logo}`;
};
