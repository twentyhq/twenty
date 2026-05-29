const WORKSPACE_BRANDING_HEAD_START = '<!-- BEGIN: Workspace Branding Head -->';
const WORKSPACE_BRANDING_HEAD_END = '<!-- END: Workspace Branding Head -->';

const escapeHtmlAttribute = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const injectWorkspaceBrandingIntoIndexHtml = ({
  indexHtml,
  displayName,
  logoUrl,
}: {
  indexHtml: string;
  displayName: string;
  logoUrl: string;
}): string => {
  const escapedDisplayName = escapeHtmlAttribute(displayName);
  const escapedLogoUrl = escapeHtmlAttribute(logoUrl);

  const brandingHead = `<link rel="icon" href="${escapedLogoUrl}" />
    <link rel="apple-touch-icon" href="${escapedLogoUrl}" />
    <meta property="og:image" content="${escapedLogoUrl}" />
    <meta property="og:title" content="${escapedDisplayName}" />
    <meta property="og:description" content="${escapedDisplayName}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:image" content="${escapedLogoUrl}" />
    <meta name="twitter:title" content="${escapedDisplayName}" />
    <meta name="twitter:description" content="${escapedDisplayName}" />
    <meta name="description" content="${escapedDisplayName}" />
    <title>${escapedDisplayName}</title>`;

  const brandingBlockPattern = new RegExp(
    `${WORKSPACE_BRANDING_HEAD_START}[\\s\\S]*?${WORKSPACE_BRANDING_HEAD_END}`,
  );

  if (!brandingBlockPattern.test(indexHtml)) {
    return indexHtml;
  }

  return indexHtml.replace(
    brandingBlockPattern,
    `${WORKSPACE_BRANDING_HEAD_START}\n    ${brandingHead}\n    ${WORKSPACE_BRANDING_HEAD_END}`,
  );
};
