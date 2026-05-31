import { isNonEmptyString } from '@sniptt/guards';

import {
  getIconMimeTypeFromUrl,
  getManifestIconSizesForMimeType,
  getManifestLargeIconSizesForMimeType,
} from './get-icon-mime-type-from-url.util';

export type WorkspaceManifest = {
  name: string;
  short_name: string;
  start_url: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  theme_color: string;
  background_color: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: string;
  }>;
};

const DEFAULT_NAME = 'CRM';
const DEFAULT_THEME_COLOR = '#000000';
const DEFAULT_BACKGROUND_COLOR = '#ffffff';

export const generateWorkspaceManifest = ({
  displayName,
  logoUrl,
}: {
  displayName?: string | null;
  logoUrl?: string | null;
}): WorkspaceManifest => {
  const name = isNonEmptyString(displayName) ? displayName : DEFAULT_NAME;

  const icons: WorkspaceManifest['icons'] = [];

  if (isNonEmptyString(logoUrl)) {
    const iconType = getIconMimeTypeFromUrl(logoUrl);

    icons.push(
      {
        src: logoUrl,
        sizes: getManifestIconSizesForMimeType(iconType),
        type: iconType,
        purpose: 'any',
      },
      {
        src: logoUrl,
        sizes: getManifestLargeIconSizesForMimeType(iconType),
        type: iconType,
        purpose: 'any',
      },
    );
  } else {
    // Generic neutral icon path for fork-level replacement.
    // See tofu/BRANDING.md for how to customize the default PWA icon.
    icons.push({
      src: '/branding/default-app-icon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'any',
    });
  }

  return {
    name,
    short_name: name,
    start_url: '.',
    display: 'standalone',
    theme_color: DEFAULT_THEME_COLOR,
    background_color: DEFAULT_BACKGROUND_COLOR,
    icons,
  };
};
