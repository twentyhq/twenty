import { buildPublicAssetUrl } from 'twenty-shared/utils';

export const resolveApplicationLogoUrl = ({
  logo,
  serverUrl,
  workspaceId,
  applicationId,
}: {
  logo: string | null | undefined;
  serverUrl: string;
  workspaceId: string;
  applicationId: string;
}): string | null => {
  return buildPublicAssetUrl({
    path: logo,
    serverUrl,
    workspaceId,
    applicationId,
  });
};
