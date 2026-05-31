import { isNonEmptyString } from '@sniptt/guards';

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
    icons.push(
      {
        src: logoUrl,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: logoUrl,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    );
  } else {
    // Generic neutral icon path for fork-level replacement.
    // See tofu/BRANDING.md for how to customize the default PWA icon.
    icons.push(
      {
        src: '/branding/default-app-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    );
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
