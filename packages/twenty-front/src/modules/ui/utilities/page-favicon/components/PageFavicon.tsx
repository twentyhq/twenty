import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { isNonEmptyString } from '@sniptt/guards';
import { getImageAbsoluteURI, isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const DEFAULT_PWA_NAME = 'CRM';
const STATIC_MANIFEST_PATH = '/manifest.json';

const getImageMimeTypeFromUrl = (imageUrl: string): string => {
  const normalizedUrl = imageUrl.toLowerCase();

  if (normalizedUrl.includes('.svg')) {
    return 'image/svg+xml';
  }

  if (normalizedUrl.includes('.jpg') || normalizedUrl.includes('.jpeg')) {
    return 'image/jpeg';
  }

  if (normalizedUrl.includes('.webp')) {
    return 'image/webp';
  }

  return 'image/png';
};

const buildWebAppManifest = ({
  displayName,
  iconUrl,
  iconMimeType,
}: {
  displayName: string;
  iconUrl: string;
  iconMimeType: string;
}) => ({
  short_name: displayName,
  name: displayName,
  start_url: '.',
  display: 'standalone',
  // oxlint-disable-next-line twenty/no-hardcoded-colors
  theme_color: '#000000',
  // oxlint-disable-next-line twenty/no-hardcoded-colors
  background_color: '#ffffff',
  icons: [
    {
      src: iconUrl,
      sizes: '192x192',
      type: iconMimeType,
      purpose: 'any',
    },
    {
      src: iconUrl,
      sizes: '512x512',
      type: iconMimeType,
      purpose: 'any',
    },
  ],
});

export const PageFavicon = () => {
  const workspacePublicData = useAtomStateValue(workspacePublicDataState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const workspaceLogo = workspacePublicData?.logo ?? currentWorkspace?.logo;
  const workspaceDisplayName =
    workspacePublicData?.displayName ??
    currentWorkspace?.displayName ??
    DEFAULT_PWA_NAME;

  const logoUrl = useMemo(
    () =>
      isDefined(workspaceLogo)
        ? getImageAbsoluteURI({
            imageUrl: workspaceLogo,
            baseUrl: REACT_APP_SERVER_BASE_URL,
          })
        : undefined,
    [workspaceLogo],
  );

  const iconMimeType = useMemo(
    () => (isDefined(logoUrl) ? getImageMimeTypeFromUrl(logoUrl) : undefined),
    [logoUrl],
  );

  const pwaDisplayName = isNonEmptyString(workspaceDisplayName)
    ? workspaceDisplayName
    : DEFAULT_PWA_NAME;

  useEffect(() => {
    const manifestLinkElement = document.querySelector('link[rel="manifest"]');

    if (!isDefined(manifestLinkElement)) {
      return;
    }

    if (!isDefined(logoUrl) || !isDefined(iconMimeType)) {
      manifestLinkElement.setAttribute('href', STATIC_MANIFEST_PATH);
      return;
    }

    const manifest = buildWebAppManifest({
      displayName: pwaDisplayName,
      iconUrl: logoUrl,
      iconMimeType,
    });

    const manifestBlob = new Blob([JSON.stringify(manifest)], {
      type: 'application/json',
    });
    const manifestBlobUrl = URL.createObjectURL(manifestBlob);

    manifestLinkElement.setAttribute('href', manifestBlobUrl);

    return () => {
      URL.revokeObjectURL(manifestBlobUrl);
      manifestLinkElement.setAttribute('href', STATIC_MANIFEST_PATH);
    };
  }, [iconMimeType, logoUrl, pwaDisplayName]);

  if (!isDefined(logoUrl) || !isDefined(iconMimeType)) {
    return null;
  }

  return (
    <Helmet>
      <link rel="icon" type={iconMimeType} href={logoUrl} />
      <link rel="apple-touch-icon" href={logoUrl} />
      <meta name="apple-mobile-web-app-title" content={pwaDisplayName} />
    </Helmet>
  );
};
