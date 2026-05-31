import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

/**
 * Client-side favicon + PWA manifest handling.
 *
 * IMPORTANT (May 2026 white-label changes):
 * - The server (workspace-branding.middleware) now owns `/manifest.json` and `/favicon.ico`.
 * - When a workspace logo is set, the server returns a fully branded manifest + 302 favicon redirect.
 * - This component is mostly a progressive enhancement / safety net for the logged-in app.
 * - The old client-side Blob manifest swap is only used when a workspace logo exists.
 * - See tofu/BRANDING.md for the full asset replacement map.
 */

const DEFAULT_PWA_NAME = 'CRM';
const STATIC_MANIFEST_PATH = '/manifest.json';

const getServerFaviconUrl = (): string => {
  const serverBaseUrl = REACT_APP_SERVER_BASE_URL.replace(/\/$/, '');

  return `${serverBaseUrl}/favicon.ico`;
};

const getIconType = (url: string): string => {
  if (url.toLowerCase().endsWith('.svg')) return 'image/svg+xml';
  if (url.toLowerCase().endsWith('.ico')) return 'image/x-icon';
  return 'image/png';
};

const buildWebAppManifest = ({
  displayName,
  iconUrl,
}: {
  displayName: string;
  iconUrl: string;
}) => {
  const iconType = getIconType(iconUrl);

  return {
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
        sizes: iconType === 'image/svg+xml' ? 'any' : '192x192',
        type: iconType,
        purpose: 'any',
      },
      {
        src: iconUrl,
        sizes: iconType === 'image/svg+xml' ? 'any' : '512x512',
        type: iconType,
        purpose: 'any',
      },
    ],
  };
};

export const PageFavicon = () => {
  const workspacePublicData = useAtomStateValue(workspacePublicDataState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const workspaceLogo = workspacePublicData?.logo ?? currentWorkspace?.logo;
  const workspaceDisplayName =
    workspacePublicData?.displayName ??
    currentWorkspace?.displayName ??
    DEFAULT_PWA_NAME;

  const hasWorkspaceLogo = isNonEmptyString(workspaceLogo);
  const faviconUrl = hasWorkspaceLogo
    ? workspaceLogo
    : getServerFaviconUrl();

  const pwaDisplayName = isNonEmptyString(workspaceDisplayName)
    ? workspaceDisplayName
    : DEFAULT_PWA_NAME;

  useEffect(() => {
    const manifestLinkElement = document.querySelector('link[rel="manifest"]');

    if (!isDefined(manifestLinkElement)) {
      return;
    }

    if (!hasWorkspaceLogo) {
      manifestLinkElement.setAttribute('href', STATIC_MANIFEST_PATH);
      return;
    }

    const manifest = buildWebAppManifest({
      displayName: pwaDisplayName,
      iconUrl: faviconUrl,
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
  }, [faviconUrl, hasWorkspaceLogo, pwaDisplayName]);

  if (!hasWorkspaceLogo) {
    return null;
  }

  return (
    <Helmet>
      <link rel="icon" href={faviconUrl} />
      <link rel="apple-touch-icon" href={faviconUrl} />
      <meta name="apple-mobile-web-app-title" content={pwaDisplayName} />
    </Helmet>
  );
};
