const isAbsoluteUrl = (url: string): boolean =>
  url.startsWith('http://') || url.startsWith('https://');

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
  if (!logo) {
    return null;
  }

  if (isAbsoluteUrl(logo)) {
    return logo;
  }

  return `${serverUrl}/public-assets/${workspaceId}/${applicationId}/${logo}`;
};
